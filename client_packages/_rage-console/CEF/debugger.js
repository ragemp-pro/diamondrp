/****************************************************************************
*
* PROJECT: 	     rage-console
* DESCRIPTION:   Console for RAGE Multiplayer
* AUTHOR:        Kasimir
* VERSION:       0.3.0
*
****************************************************************************/

!function(){return function e(r,o,t){function n(u,s){if(!o[u]){if(!r[u]){var l="function"==typeof require&&require;if(!s&&l)return l(u,!0);if(i)return i(u,!0);var f=new Error("Cannot find module '"+u+"'");throw f.code="MODULE_NOT_FOUND",f}var a=o[u]={exports:{}};r[u][0].call(a.exports,function(e){var o=r[u][1][e];return n(o||e)},a,a.exports,e,r,o,t)}return o[u].exports}for(var i="function"==typeof require&&require,u=0;u<t.length;u++)n(t[u]);return n}}()({1:[function(e,r,o){(function(e){mp&&(e.console=new class{constructor(){window.onerror=this._error.bind(this)}_output(e){e.env="cef",e.timestamp=(new Date).toISOString(),mp.trigger("console:chrome",JSON.stringify(e))}log(e){this._output({message:e,level:"info"})}info(e){this._output({message:e,level:"info"})}warn(e){this._output({message:e,level:"warn"})}debug(e){this._output({message:e,level:"debug"})}error(e){this._output({message:e,level:"error"})}_error(e,r,o,t,n){(e=e).indexOf("Script error.")>-1&&(e="Script Error: Cannot show error details, enable crossorigin in script tag"),this._output({message:e,level:"error",information:{url:r,lineNo:o,columnNo:t,columnNo:t,error:n}})}})}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1]);