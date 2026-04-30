import mongoose from "mongoose";

const DEFAULT_LOCAL_MONGODB_URI = "mongodb://127.0.0.1:27017/st_michaels_store";
const RETRY_COOLDOWN_MS = 5_000;
const DEV_SERVER_SELECTION_TIMEOUT_MS = 1_500;

const globalMongooseState = globalThis;
const cachedState = globalMongooseState.__stMichaelsMongoose ?? {
    promise: null,
    unavailableUntil: 0,
    lastError: null,
};

if (!globalMongooseState.__stMichaelsMongoose) {
    globalMongooseState.__stMichaelsMongoose = cachedState;
}

function resolveMongoUris() {
    const configuredUris = process.env.NODE_ENV === "development"
        ? [
                process.env.MONGODB_LOCAL_URI,
                process.env.LOCAL_MONGODB_URI,
                process.env.MONGODB_URI,
            ]
        : [
                process.env.MONGODB_URI,
                process.env.MONGODB_LOCAL_URI,
                process.env.LOCAL_MONGODB_URI,
            ];

    if (!configuredUris.some(Boolean) && process.env.NODE_ENV === "development") {
        configuredUris.push(DEFAULT_LOCAL_MONGODB_URI);
    }

    return [...new Set(configuredUris.filter((uri) => typeof uri === "string" && uri.trim()))];
}

function getConnectOptions() {
    return process.env.NODE_ENV === "development"
        ? { serverSelectionTimeoutMS: DEV_SERVER_SELECTION_TIMEOUT_MS }
        : {};
}

export function isMongoConnectionError(error) {
    const errorMessage = error?.message || "";

    return (
        error?.name === "MongooseServerSelectionError" ||
        error?.name === "MongoNetworkError" ||
        error?.code === "ECONNREFUSED" ||
        error?.code === "ENOTFOUND" ||
        error?.code === "querySrv" ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("ENOTFOUND") ||
        errorMessage.includes("querySrv")
    );
}

async function awaitConnectionPromise(connectionPromise, allowFailure) {
    try {
        return await connectionPromise;
    } catch (error) {
        if (allowFailure) {
            return null;
        }

        throw error;
    }
}

export async function mongooseConnect(options = {}) {
    const { allowFailure = false } = options;

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection.asPromise();
    }

    if (cachedState.promise) {
        return awaitConnectionPromise(cachedState.promise, allowFailure);
    }

    if (cachedState.unavailableUntil > Date.now()) {
        if (allowFailure) {
            return null;
        }

        throw cachedState.lastError || new Error("MongoDB is temporarily unavailable.");
    }

    const candidateUris = resolveMongoUris();
    if (!candidateUris.length) {
        const error = new Error("No MongoDB connection string is configured.");
        if (allowFailure) {
            return null;
        }

        throw error;
    }

    cachedState.promise = (async () => {
        let lastError = null;

        for (const uri of candidateUris) {
            try {
                const connection = await mongoose.connect(uri, getConnectOptions());
                cachedState.unavailableUntil = 0;
                cachedState.lastError = null;
                return connection;
            } catch (error) {
                lastError = error;

                if (mongoose.connection.readyState !== 0) {
                    await mongoose.disconnect().catch(() => {});
                }
            }
        }

        cachedState.lastError = lastError;
        cachedState.unavailableUntil = isMongoConnectionError(lastError)
            ? Date.now() + RETRY_COOLDOWN_MS
            : 0;

        throw lastError;
    })();

    try {
        return await awaitConnectionPromise(cachedState.promise, allowFailure);
    } finally {
        cachedState.promise = null;
    }
}