// Open modal when clicking "Report Lost Item" button
document.querySelectorAll("#openFormButton").forEach(button => {
    button.addEventListener("click", function() {
        document.getElementById("reportModal").style.display = "flex";
    });
});

// Close modal when clicking the close button
document.querySelector(".close").addEventListener("click", function() {
    document.getElementById("reportModal").style.display = "none";
});

// Preview Image Before Upload
document.getElementById('itemImage').addEventListener('change', function(event) {
    let reader = new FileReader();
    reader.onload = function() {
        document.getElementById('preview').innerHTML = `<img src="${reader.result}" width="100" height="100" style="border-radius:5px;">`;
    };
    reader.readAsDataURL(event.target.files[0]);
});