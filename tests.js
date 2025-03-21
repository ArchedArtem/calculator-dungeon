document.addEventListener("DOMContentLoaded", function () {
    displayTestResults();
});

function displayTestResults() {
    const testResults = JSON.parse(localStorage.getItem("testResults")) || [];
    const testList = document.getElementById("testList");

    if (testResults.length === 0) {
        testList.innerHTML = "<li>Нет результатов тестов.</li>";
        return;
    }

    testList.innerHTML = ""; // Очищаем список перед заполнением

    testResults.forEach(({ expression, result, isError }, index) => {
        const listItem = document.createElement("li");
        listItem.classList.add("test-item");

        // Определяем, успешный тест или с ошибкой
        if (isError || result === "Ошибка" || result === "Число слишком большое" || result === "Число слишком маленькое") {
            listItem.classList.add("error");
        } else {
            listItem.classList.add("success");
        }

        listItem.innerHTML = `
            <strong>Тест ${index + 1}:</strong> ${expression} = ${result}
        `;
        testList.appendChild(listItem);
    });
}