export default {
    namespaced: true,
    state: {
        firstName: 'John',
        lastName: 'Doe'
    },
    getters: {
        fullName: function(state) {
            return `${state.firstName} ${state.lastName}`
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
    state() {
        return {
            groups: [],
            tasksDict: {},
        };
    },

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