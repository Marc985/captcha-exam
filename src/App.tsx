import React, { useState } from "react";
import CaptchaComponent from "./components/CaptchaComponent";

const App: React.FC = () => {
    const [number, setNumber] = useState<number | "">("");
    const [output, setOutput] = useState<string>("");
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [captchaRequired, setCaptchaRequired] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const apiUrl: string = "https://api.prod.jcloudify.com/whoami";

    const fetchWithRetry = async (url: string, retries: number = 3): Promise<Response> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url);
                return response;
            } catch (error) {
                if (attempt === retries) throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        throw new Error("Failed after retries");
    };

    const runSequence = async (startIndex: number = 1) => {
        for (let i = startIndex; i <= Number(number); i++) {
            setCurrentIndex(i);

            try {
                const response = await fetchWithRetry(apiUrl);

                if (response.ok && response.status === 403) {
                    setOutput((prev) => prev + `${i}. Forbidden\n`);
                } else if (response.status === 405) {
                    setOutput((prev) => prev + `${i}. Captcha required, stopping the sequence.\n`);
                    setCaptchaRequired(true);
                    break;
                } else {
                    setOutput((prev) => prev + `${i}. Forbidden\n`);
                }
            } catch (error) {
                setOutput((prev) => prev + `${i}. Error: ${error instanceof Error ? error.message : "Unknown error"}\n`);
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        if (!captchaRequired) {
            setOutput((prev) => prev + "Sequence complete!");
        }

        setIsRunning(false);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (typeof number === "string" || number < 1 || number > 1000) {
            alert("Please enter a number between 1 and 1000.");
            return;
        }

        setIsRunning(true);
        setOutput("");
        setCaptchaRequired(false);
        await runSequence(1);
    };

    const handleCaptchaSuccess = async (wafToken: string) => {
        console.log("WAF Token reçu :", wafToken);
        setCaptchaRequired(false);
        await runSequence(currentIndex + 1); // Reprendre après le dernier index traité
    };

    return (
        <div style={{ fontFamily: "Arial, sans-serif", margin: "2em" }}>
            <h1>Generate Forbidden Sequence</h1>
            {!isRunning && (
                <form onSubmit={handleSubmit}>
                    <label htmlFor="numberInput">Enter a number (1-1000):</label>
                    <input
                        type="number"
                        id="numberInput"
                        value={number}
                        onChange={(e) => setNumber(e.target.value === "" ? "" : parseInt(e.target.value))}
                        min="1"
                        max="1000"
                        required
                    />
                    <button type="submit">Submit</button>
                </form>
            )}
            <pre
                style={{
                    marginTop: "1em",
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                    background: "#f9f9f9",
                    padding: "1em",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                }}
            >
                {output}
            </pre>
            {isRunning && <progress value={currentIndex} max={number}></progress>}
            {captchaRequired && <CaptchaComponent onCaptchaSuccess={handleCaptchaSuccess} />}
        </div>
    );
};

export default App;

