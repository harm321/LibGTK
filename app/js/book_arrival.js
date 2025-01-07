
document.getElementById('addBookBtn').addEventListener('click', function() {
    document.getElementById('addBookModal').style.display = 'block';
});

window.onclick = function(event) {
    if (event.target == document.getElementById('addBookModal')) {
        document.getElementById('addBookModal').style.display = 'none';
    }
}
