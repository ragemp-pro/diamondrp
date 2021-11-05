import { Component } from "react";
import React from "react";
import { user } from "../../api/data";
export class Auth extends Component<any, any> {
    constructor(props: any) {
        super(props);
        document.title = "Авторизация"
    }
    render() {
        return <div className="content">
            <div className="sidenav">
                <div className="login-main-text">
                    <h2>Админ панель<br /> Авторизация</h2>
                    <p>Необходимо ввести данные от учётной записи</p>
                </div>
            </div>
            <div className="main">
                <div className="col-md-6 col-sm-12">
                    <div className="login-form">
                        <form>
                            <div className="form-group">
                                <label>RP Имя учётной записи</label>
                                <input type="text" className="form-control" placeholder="Login" id="login" />
                            </div>
                            <div className="form-group">
                                <label>Пароль для входа</label>
                                <input type="password" className="form-control" placeholder="Password" id="pass" />
                            </div>
                            <button type="submit" className="btn btn-black" onClick={(e) => {
                                e.preventDefault();
                                user.auth(document.getElementById("login").value, document.getElementById("pass").value)
                            }}>Авторизоватся</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    }
}