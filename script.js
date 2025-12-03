//your JS code here. If required.
let clickCount = 0;
let counterTimer = null;
const clickCountSpan = document.getElementById('clickCount');

function incrementClickCounter() {
    clickCount++;
    clickCountSpan.textContent = clickCount;

    if (!counterTimer) {
        counterTimer = setTimeout(() => {
            clickCount = 0;
            clickCountSpan.textContent = 0;
            counterTimer = null;
        }, 10000);
    }
}

const queue = [];
let lastResetTime = Date.now();
let callCountLastSecond = 0;

function scheduleFetch() {
    return new Promise((resolve) => {
        queue.push(resolve);
        processQueue();
    });
}

function processQueue() {
    const now = Date.now();

    if (now - lastResetTime >= 1000) {
        callCountLastSecond = 0;
        lastResetTime = now;
    }

    if (callCountLastSecond >= 5) {
        setTimeout(processQueue, 50);
        return;
    }

    if (queue.length > 0) {
        const resolve = queue.shift();
        callCountLastSecond++;
        resolve();
        setTimeout(processQueue, 0);
    }
}

let burstCount = 0;
let burstWindowStart = Date.now();

function enforceTenSecondRule(fetchAction) {
    const now = Date.now();

    if (now - burstWindowStart >= 10000) {
        burstCount = 0;
        burstWindowStart = now;
    }

    burstCount++;

	if (burstCount <= 5) {
		return fetchAction();
	} else {
		alert("Too many API calls. Please wait and try again.");
		return Promise.resolve();
	}
}

function fetchTodo() {
    return scheduleFetch().then(() =>
        fetch("https://jsonplaceholder.typicode.com/todos/1")
            .then(res => res.json())
    );
}

function displayResult(data) {
    const resultsDiv = document.getElementById("results");
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
        <strong>ID:</strong> ${data.id} <br>
        <strong>Title:</strong> ${data.title} <br>
        <strong>Completed:</strong> ${data.completed}
    `;
    resultsDiv.appendChild(div);
}

document.getElementById("fetchBtn").addEventListener("click", () => {
    incrementClickCounter();

    enforceTenSecondRule(() => fetchTodo().then(displayResult));
});
