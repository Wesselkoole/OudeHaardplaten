document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".btn-check");
    
    function loadContent(page) {
        fetch(page)
            .then(response => response.text())
            .then(data => {
                document.getElementById("content").innerHTML = data;
            })
            .catch(error => console.error("Error loading content:", error));
    }

    function updateBackground() {
        // Remove active class from all labels
        document.querySelectorAll("label.switch-btn").forEach(label => {
            label.classList.remove("active");
        });

        // Find the checked input
        const checkedInput = document.querySelector(".btn-check:checked");
        if (checkedInput) {
            const label = document.querySelector(`label[for="${checkedInput.id}"]`);
            label.classList.add("active"); // Apply active styling

            // Load the corresponding content based on the checked button
            if (checkedInput.id === "option1") {
                loadContent("../haardplaten.html");
            } else if (checkedInput.id === "option2") {
                loadContent("../haardblokken.html");
            }
        }
    }

    // Attach event listeners
    buttons.forEach(button => {
        button.addEventListener("change", updateBackground);
    });

    // Initialize the content for the checked button
    updateBackground();
});
