function calculateExpression(expression) {
    try {
        if (/\/0(?!\.\d+)/.test(expression)) {
            return "Ошибка";
        }

        let result = eval(expression);

        if (Math.abs(result) > 1e7) {
            return "Число слишком большое";
        } else if (Math.abs(result) < 1e-7 && result !== 0) {
            return "Число слишком маленькое";
        }

        result = parseFloat(result.toFixed(7));
        return result.toString();
    } catch (err) {
        return "Ошибка";
    }
}

if (typeof module !== "undefined") {
    module.exports = { calculateExpression };
}