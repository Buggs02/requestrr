export const GET_PAUSE_STATE = "administration:get_pause_state";

export function setPauseState(state) {
    return {
        type: GET_PAUSE_STATE,
        payload: state
    };
};

export function getPauseState() {
    return (dispatch, getState) => {

        return fetch("../api/administration/pause-state", {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(data => data.json())
            .then(data => {
                dispatch(setPauseState(data));
                return data;
            });
    };
};

export function pauseRequests(reason, autoResumeInMinutes) {
    return (dispatch, getState) => {
        const state = getState();

        return fetch("../api/administration/pause-state/pause", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${state.user.token}`
            },
            body: JSON.stringify({
                'Reason': reason,
                'AutoResumeInMinutes': autoResumeInMinutes
            })
        })
            .then(data => data.json())
            .then(data => {
                dispatch(setPauseState(data));
                return data;
            });
    };
};

export function resumeRequests() {
    return (dispatch, getState) => {
        const state = getState();

        return fetch("../api/administration/pause-state/resume", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${state.user.token}`
            }
        })
            .then(data => data.json())
            .then(data => {
                dispatch(setPauseState(data));
                return data;
            });
    };
};

export function clearBlockedAttempts() {
    return (dispatch, getState) => {
        const state = getState();

        return fetch("../api/administration/pause-state/clear-blocked-attempts", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${state.user.token}`
            }
        })
            .then(data => data.json())
            .then(data => {
                dispatch(setPauseState(data));
                return data;
            });
    };
};
