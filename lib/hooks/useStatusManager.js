import { useCallback, useEffect, useRef, useState } from "react";
function useStatusManager({ statusFn, onStatusUpdate, getSubscriptionKey, getStatusFromCandidate, getStatusForCandidate, onSubscribe, onUnsubscribe, updateInterval = 30000, debounceDelay = 300, }) {
    const subscriptions = useRef({});
    const subscriptionStatus = useRef({});
    const pendingStatus = useRef({});
    const updateIntervalRef = useRef(null);
    const debounceTimeoutRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const getActiveSubscriptions = useCallback(() => {
        return Object.entries(subscriptions.current)
            .filter((entry) => entry[1] !== undefined)
            .map(([key, candidate]) => ({
            key: key,
            candidate,
        }));
    }, []);
    const stopStatusInterval = useCallback(() => {
        if (updateIntervalRef.current) {
            clearInterval(updateIntervalRef.current);
            updateIntervalRef.current = null;
        }
    }, []);
    const startStatusInterval = useCallback(() => {
        if (updateIntervalRef.current)
            return;
        updateIntervalRef.current = setInterval(() => {
            const active = getActiveSubscriptions();
            const candidates = active.map(({ candidate }) => candidate);
            if (!candidates.length) {
                stopStatusInterval();
                return;
            }
            if (debounceTimeoutRef.current)
                clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = setTimeout(async () => {
                setIsLoading(true);
                try {
                    const response = await statusFn(candidates);
                    active.forEach(({ key, candidate }) => {
                        const newStatus = getStatusForCandidate(key, response);
                        const currentStatus = subscriptionStatus.current[key];
                        if (newStatus !== currentStatus) {
                            subscriptionStatus.current[key] = newStatus;
                            onStatusUpdate(candidate);
                        }
                    });
                }
                catch (err) {
                    console.error("Polling error:", err);
                }
                finally {
                    setIsLoading(false);
                }
            }, debounceDelay);
        }, updateInterval);
    }, [
        debounceDelay,
        updateInterval,
        getActiveSubscriptions,
        statusFn,
        getStatusForCandidate,
        onStatusUpdate,
        stopStatusInterval,
    ]);
    const subscribe = useCallback(async (candidate) => {
        const key = getSubscriptionKey(candidate);
        if (!subscriptions.current[key]) {
            subscriptions.current[key] = candidate;
            subscriptionStatus.current[key] = getStatusFromCandidate(candidate);
            onSubscribe?.(candidate);
        }
        pendingStatus.current[key] = true;
        try {
            const response = await statusFn([candidate]);
            const newStatus = getStatusForCandidate(key, response);
            const currentStatus = subscriptionStatus.current[key];
            if (newStatus !== currentStatus) {
                subscriptionStatus.current[key] = newStatus;
                onStatusUpdate(candidate);
            }
        }
        catch (err) {
            console.error("Immediate fetch failed for", key, err);
        }
        finally {
            pendingStatus.current[key] = false;
        }
        startStatusInterval();
    }, [
        getSubscriptionKey,
        getStatusFromCandidate,
        onSubscribe,
        startStatusInterval,
        statusFn,
        getStatusForCandidate,
        onStatusUpdate,
    ]);
    const unsubscribe = useCallback((candidate) => {
        const key = getSubscriptionKey(candidate);
        if (subscriptions.current[key]) {
            delete subscriptions.current[key];
            delete subscriptionStatus.current[key];
            delete pendingStatus.current[key];
            onUnsubscribe?.(candidate);
        }
        if (Object.keys(subscriptions.current).length === 0) {
            stopStatusInterval();
        }
    }, [getSubscriptionKey, onUnsubscribe, stopStatusInterval]);
    useEffect(() => {
        return () => {
            Object.values(subscriptions.current).forEach((candidate) => {
                if (candidate)
                    onUnsubscribe?.(candidate);
            });
            subscriptions.current = {};
            subscriptionStatus.current = {};
            pendingStatus.current = {};
            stopStatusInterval();
            if (debounceTimeoutRef.current)
                clearTimeout(debounceTimeoutRef.current);
        };
    }, [onUnsubscribe, stopStatusInterval]);
    const isPending = useCallback((candidate) => {
        const key = getSubscriptionKey(candidate);
        return pendingStatus.current[key] ?? false;
    }, [getSubscriptionKey]);
    return {
        subscribe,
        unsubscribe,
        isLoading,
        isPending,
    };
}
export { useStatusManager };
