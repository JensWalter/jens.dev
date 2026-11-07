document.addEventListener('DOMContentLoaded', function () {

    /* ============================================================ */
    /* Scroll To Top */
    /* ============================================================ */

    document.querySelectorAll('.js-jump-top').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
});
