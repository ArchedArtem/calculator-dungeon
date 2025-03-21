document.addEventListener("DOMContentLoaded", function () {
    // Убираем mocha.setup("bdd") из калькулятора, он будет на странице тестов
});

const display = document.querySelector(".display");
const massiveButtons = Array.from(document.querySelectorAll(".button"));

let currentInput = "0";
let lastOperator = null;
let operatorUsed = false;
let testResults = JSON.parse(localStorage.getItem("testResults")) || []; // Загружаем тесты из localStorage

function updateDisplay() {
    display.innerHTML = currentInput;

    const displayWidth = display.offsetWidth;
    const textWidth = display.scrollWidth;
    let fontSize = parseFloat(window.getComputedStyle(display).fontSize);
    const minFontSize = 20;

    while (textWidth > displayWidth && fontSize > minFontSize) {
        fontSize -= 2;
        display.style.fontSize = `${fontSize}px`;
    }

    if (textWidth <= displayWidth && fontSize < 70) {
        fontSize = Math.min(70, fontSize + 2);
        display.style.fontSize = `${fontSize}px`;
    }
}

function handleInput(value) {
    const isErrorState =
        currentInput === "Ошибка" ||
        currentInput === "Число слишком большое" ||
        currentInput === "Число слишком маленькое";

    if (isErrorState) {
        if (value === "AC") {
            currentInput = "0";
            lastOperator = null;
            operatorUsed = false;
            testResults = [];
            localStorage.setItem("testResults", JSON.stringify(testResults)); // Очищаем тесты
        } else if (["+", "-", "*", "/"].includes(value)) {
            currentInput = "0" + value;
            lastOperator = value;
            operatorUsed = true;
        } else if (value === "=") {
            currentInput = "0";
        } else if (/[0-9.]/.test(value)) {
            currentInput = value;
            lastOperator = null;
            operatorUsed = false;
        } else {
            return;
        }
        display.style.fontSize = "70px";
        updateDisplay();
        return;
    }

    switch (value) {
        case "AC":
            currentInput = "0";
            lastOperator = null;
            operatorUsed = false;
            testResults = [];
            localStorage.setItem("testResults", JSON.stringify(testResults)); // Очищаем тесты
            display.style.fontSize = "70px";
            break;

        case "=":
            const expression = currentInput;
            const result = calculateExpression(expression);
            testResults.push({ expression, result, isError: result === "Ошибка" });
            localStorage.setItem("testResults", JSON.stringify(testResults)); // Сохраняем тесты
            currentInput = result;
            operatorUsed = false;
            lastOperator = null;
            break;

        case "+":
        case "-":
        case "*":
        case "/":
            if (operatorUsed && !/[+\-*/]$/.test(currentInput)) {
                const expression = currentInput;
                const result = calculateExpression(expression);
                testResults.push({ expression, result, isError: result === "Ошибка" });
                localStorage.setItem("testResults", JSON.stringify(testResults)); // Сохраняем тесты
                currentInput = result;
                if (!isErrorState) {
                    currentInput += value;
                    lastOperator = value;
                    operatorUsed = true;
                }
            } else if (!operatorUsed) {
                currentInput += value;
                lastOperator = value;
                operatorUsed = true;
            } else {
                currentInput = currentInput.slice(0, -1) + value;
                lastOperator = value;
            }
            break;

        case "+/-":
            if (!/[+\-*/]$/.test(currentInput)) {
                if (currentInput.startsWith("-")) {
                    currentInput = currentInput.slice(1);
                } else if (currentInput !== "0") {
                    currentInput = "-" + currentInput;
                }
            }
            break;

        case "%":
            try {
                let number = parseFloat(currentInput);
                let result = number / 100;
                const expression = `${currentInput} / 100`;

                if (Math.abs(result) > 1e7) {
                    currentInput = "Число слишком большое";
                    testResults.push({ expression, result: "Число слишком большое", isError: false });
                } else if (Math.abs(result) < 1e-7 && result !== 0) {
                    currentInput = "Число слишком маленькое";
                    testResults.push({ expression, result: "Число слишком маленькое", isError: false });
                } else {
                    result = parseFloat(result.toFixed(7));
                    currentInput = result.toString();
                    testResults.push({ expression, result: currentInput, isError: false });
                }
                localStorage.setItem("testResults", JSON.stringify(testResults)); // Сохраняем тесты
            } catch (err) {
                currentInput = "Ошибка";
                testResults.push({ expression: `${currentInput} / 100`, result: "Ошибка", isError: true });
                localStorage.setItem("testResults", JSON.stringify(testResults)); // Сохраняем тесты
            }
            break;

        case ".":
            let numbers = currentInput.split(/[\+\-\*\/]/);
            let lastNumber = numbers[numbers.length - 1];
            if (!lastNumber.includes(".")) {
                currentInput += value;
            }
            break;

        case "Backspace":
            if (currentInput.length > 1) {
                currentInput = currentInput.slice(0, -1);
                if (/[+\-*/]$/.test(currentInput)) {
                    lastOperator = currentInput.slice(-1);
                    operatorUsed = true;
                } else {
                    operatorUsed = /[+\-*/]/.test(currentInput);
                    lastOperator = operatorUsed ? currentInput.match(/[+\-*/]/g).pop() : null;
                }
            } else {
                currentInput = "0";
                lastOperator = null;
                operatorUsed = false;
            }
            break;

        default:
            if (/[0-9]/.test(value)) {
                const lastOperatorIndex = currentInput.lastIndexOf("/");
                if (
                    lastOperator === "/" &&
                    lastOperatorIndex !== -1 &&
                    currentInput.slice(lastOperatorIndex + 1) === "0" &&
                    value === "0"
                ) {
                    break;
                }

                if (currentInput === "0" && value !== "0") {
                    currentInput = value;
                } else if (currentInput === "0" && value === "0") {
                } else if (/[+\-*/]$/.test(currentInput)) {
                    currentInput += value;
                    operatorUsed = true;
                } else if (currentInput.length < 15) {
                    currentInput += value;
                }
            }
            break;
    }

    updateDisplay();
}

// Убираем функцию runTests из калькулятора, она будет на отдельной странице

massiveButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
        const value = e.target.innerHTML;
        handleInput(value);
    });
});

document.addEventListener("keydown", (e) => {
    e.preventDefault();

    const keyMap = {
        "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
        "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
        "+": "+", "-": "-", "*": "*", "/": "/",
        ".": ".", ",": ".", "Enter": "=", "=": "=",
        "Escape": "AC", "%": "%", "Backspace": "Backspace",
        "Delete": "+/-"
    };

    const value = keyMap[e.key];
    if (value) {
        handleInput(value);
    }
});