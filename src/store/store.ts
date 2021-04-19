import { createStore, applyMiddleware, Store } from "redux"
import thunk from "redux-thunk"
import reducer from "./reducer"
import { Action, DispatchType, State } from "./type";

const store: Store<State, Action> & {
    dispatch: DispatchType
} = createStore(reducer, applyMiddleware(thunk))



export default store;