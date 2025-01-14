import "./index.css";
import App from "./App";
import React from "react";
import store from "./store/store";
import {BrowserRouter} from "react-router-dom";
import {Provider} from "react-redux";
import {createRoot} from "react-dom/client";
import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Provider store={store}>
            <App/>
        </Provider>
    </BrowserRouter>
)
