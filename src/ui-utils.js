import React from "react"


export const ReactiveTextArea = ({ id, value, setter }) =>
    <textarea
        id={id}
        onChange={(event) => setter(event.target.value)}
        value={value} />


export const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")

    a.href = url
    a.download = filename || "download"

    const clickHandler = () => {
        setTimeout(() => {
            URL.revokeObjectURL(url)
            a.removeEventListener("click", clickHandler)
        }, 150)
    }
    a.addEventListener("click", clickHandler, false)
    a.click()

    return a
}

