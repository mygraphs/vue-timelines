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
    actions: {
        test() {
            console.log(" TEST API ACTION ");
        }
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