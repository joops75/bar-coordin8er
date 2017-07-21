var appUrl = window.location.origin

var ajaxFunctions = {
    ready: function ready(fn) {
        if (typeof fn !== 'function') {
            return
        }
        if (document.readyState === 'complete') {
            return fn()
        }
        document.addEventListener('DOMContentLoaded', fn, false)
    },
    ajaxRequest: function ajaxRequest(method, url, callback) {
        var xmlhttp = new XMLHttpRequest()
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                callback(xmlhttp.response)
            }
        }
        xmlhttp.open(method, url, true)
        xmlhttp.send()
    },
    ajaxBarRequest: function ajaxRequest(method, url, term, location, limit, offset, callback) {
        var xmlhttp = new XMLHttpRequest()
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                callback(xmlhttp.response)
            }
        }
        xmlhttp.open(method, url, true)
        xmlhttp.setRequestHeader("termdata", term)
        xmlhttp.setRequestHeader("locationdata", location)
        xmlhttp.setRequestHeader("limitdata", limit)
        xmlhttp.setRequestHeader("offsetdata", offset)
        xmlhttp.send()
    },
    ajaxAttendance: function ajaxRequest(method, url, barId, callback) {
        var xmlhttp = new XMLHttpRequest()
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                callback(xmlhttp.response)
            }
        }
        xmlhttp.open(method, url, true)
        xmlhttp.setRequestHeader("bariddata", barId)
        xmlhttp.send()
    }
}