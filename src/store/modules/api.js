export default {
    namespaced: true,
    state() {
        return {
            groups: [],
            tasksDict: {},
        };
    },
    getters: {
        groups: function(state) {
            debugger;
            return this.groups;
        },
        tasks: function(state) {
            debugger;
            return this.tasksDict;
        }
    },
    mutations: {
        setTimeline(state, json) {
            debugger;
            console.log(" SET NEW TIMELINE")
            this.groups = json.groups;
        },
        updateTask(state, task) {
        },
    },
    actions: {
        test() {
            console.log(" TEST API ACTION ");
        },
        test_obj(state, obj) {
            console.log(" TEST API PARAM " + obj.title);
        },
        async createTimeline(state, newTimeline) {
            const apiBaseUrl = process.env.VUE_APP_API_BASE_URL;

            return fetch(apiBaseUrl + "/events/create", {
                mode: 'cors',
                method: 'post',
                headers: {
                    'HTTP_KEY': process.env.VUE_APP_API_TOKEN,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTimeline),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status != "success") {
                        alert(data.error_msg);
                        return Promise.reject(data.error_msg);
                    }

                    return data;
                })
                .catch((error) => {
                    return Promise.reject("INTERNAL ERROR");
                });
        },
    }
}

console.log("EXPORT API");
/*
export const apiService = {
    namespace: true,


    actions: {
        test() {
            console.log(" TEST FOO ACTION ")
        }
    }
    actions: {
        async getData({ commit }) {
            debugger;
            const data = await fetch('https://img-api.com/api/test');
            commit('SET_DATA', await data.json());
        },
    },
    mutations: {
        setTaskJson(state, json) {
            debugger;
            console.log(" SET TASK JSON ")
        },
        updateTask(state, task) {
        },
    },
    getters: {

    }
};
*/