import React from "react"
import {useState} from "react"
import ReactDOM from "react-dom"

import {generateRulesFrom, validateSpecificationAgainstSchema} from "dcc-rules-generator"


const pretty = (json) => JSON.stringify(json, null, 2)

const tryParse = (text) => {
    try {
        return JSON.parse(text)
    } catch (e) {
        return e
    }
}


const ReactiveTextArea = ({ id, value, setter }) =>
    <textarea
        id={id}
        onChange={(event) => setter(event.target.value)}
        value={value} />


import "./styling.css"

const App = () => {
    const params = new URLSearchParams(location.search)

    const [specAsText, setSpecAsText] = useState(params.get("spec") || pretty(require("./example-spec.json")))

    const spec = tryParse(specAsText)
    const specIsJson = !(spec instanceof Error)
    const validationErrors = specIsJson
        ? validateSpecificationAgainstSchema(spec)
        : `Could not parse specification text as JSON: ${spec.message}.`

    const [beenShared, setBeenShared] = useState(false)
    const copyShareableUrlToClipboard = async () => {
        const params = new URLSearchParams()
        params.append("spec", specAsText)
        await navigator.clipboard.writeText(`${location.origin}/?${params}`)
        setBeenShared(true)
    }

    return <main>
        <h1>DCC Rules Generator</h1>
        <p>
            Write a specification for DCC validation/business rules, specifically for vaccinations, and generate the corresponding rules.
        </p>
        <div className="wrapper">
            <div>
                <span className="label">Rules' specification</span>
                <ReactiveTextArea id="spec" value={specAsText} setter={setSpecAsText} />
            </div>
            <div>
                <span className="label">Validation errors</span>
                {validationErrors === null && <p>(None.)</p>}
                {validationErrors !== null && <p>{validationErrors}</p>}
            </div>
            <div>
                <button onClick={copyShareableUrlToClipboard}>Copy shareable URL to clipboard</button>
                <span
                    className={"push-right " + (beenShared ? "fade-out" : "hidden")}
                    onAnimationEnd={() => {
                        setBeenShared(false)
                    }}
                >Copied!</span>
            </div>
            <div></div>
            <div>
                {validationErrors === null &&
                    <div>
                        <span className="label">Generated rules</span>
                        <pre>{pretty(Object.values(generateRulesFrom(spec)))}</pre>
                    </div>
                }
            </div>
        </div>
        <p>
            This app has been developed by the <a href="https://ec.europa.eu/health/ehealth/policy/network_en">European Health Network</a> (eHN), as part of the <a href="https://ec.europa.eu/info/live-work-travel-eu/coronavirus-response/safe-covid-19-vaccines-europeans/eu-digital-covid-certificate_en">EU Digital COVID Certificate effort</a>.
        </p>
    </main>
}

ReactDOM.render(<App />, document.getElementById("root"))

