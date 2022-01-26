import React from "react"
import {useState} from "react"
import ReactDOM from "react-dom"
import {generateRulesFrom, validateSpecificationAgainstSchema} from "dcc-business-rules-generator"

import {pretty, tryParse} from "./json-utils"
import {downloadBlob, ReactiveTextArea} from "./ui-utils"


import "./styling.css"

const App = () => {
    const params = new URLSearchParams(location.search)

    const [specAsText, setSpecAsText] = useState(params.get("spec") || pretty(require("./example-spec.json")))

    const spec = tryParse(specAsText)
    const specIsJson = !(spec instanceof Error)
    const specValidationErrors = specIsJson
        ? validateSpecificationAgainstSchema(spec)
        : `Could not parse specification text as JSON: ${spec.message}.`
    const specIsValid = specValidationErrors === null

    const [beenShared, setBeenShared] = useState(false)
    const copyShareableUrlToClipboard = async () => {
        const params = new URLSearchParams()
        params.append("spec", specAsText)
        await navigator.clipboard.writeText(`${location.origin}/?${params}`)
        setBeenShared(true)
    }

    const generatedRulesAsText = specIsValid && pretty(Object.values(generateRulesFrom(spec)))
    const generatedRulesAsBlob = specIsValid && new Blob([ generatedRulesAsText ], { type: "application/json" })

    const [beenDownloaded, setBeenDownloaded] = useState(false)
    const downloadGeneratedRules = async () => {
        downloadBlob(generatedRulesAsBlob, "tests.json")
        setBeenDownloaded(true)
    }

    return <main>
        <h1>DCC Business Rules Generator</h1>
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
                <p>{specIsValid ? "(None.)" : specValidationErrors}</p>
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
                {specIsValid &&
                    <div>
                        <button onClick={downloadGeneratedRules}>Download generated rules</button>
                        <span
                            className={"push-right " + (beenDownloaded ? "fade-out" : "hidden")}
                            onAnimationEnd={() => {
                                setBeenDownloaded(false)
                            }}
                        >Downloaded!</span>
                    </div>
                }
            </div>
            <div></div>
            <div>
                {specIsValid &&
                    <div>
                        <span className="label">Generated rules</span>
                        <pre>{generatedRulesAsText}</pre>
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

