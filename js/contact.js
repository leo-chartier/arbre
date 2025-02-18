/**
 * Show the contact form.
 */
function contactOpen() {
  document.getElementById("contactFader").setAttribute("open", "");
}

/**
 * Hide the contact form.
 */
function contactClose() {
  document.getElementById("contactFader").removeAttribute("open");
}

/**
 * Send an email with the form's content.
 */
function updateMailto() {
  let name = document.getElementById("formName").value.trim();
  let subjectField = document.getElementById("formSubject");
  let message = document.getElementById("formMessage").value.trim();
  let subject = subjectField.value
    ? `Arbre généalogique - ${subjectField.value}`
    : "";

  let body = `De ${name}:\n\n${message}`;
  let mailtoLink = `mailto:leo.chartier@dartybox.com?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  let submitBtn = document.getElementById("contactSubmit");
  submitBtn.href = mailtoLink;
  submitBtn.style.pointerEvents = name && subject && message ? "all" : "none";
  submitBtn.style.opacity = name && subject && message ? "1" : "0.6";
}

document
  .querySelectorAll(
    "#contactForm input, #contactForm select, #contactForm textarea"
  )
  .forEach((input) => {
    input.addEventListener("input", updateMailto);
  });
