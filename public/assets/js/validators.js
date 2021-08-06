function validateAll(elements) {
  let result = true;
  elements.forEach((element) => (result = validate(element) && result));
  return result;
}

function validate(element) {
  if (element.tagName === "INPUT" && element.type === "text") {
    return validateText(element);
  } else if (element.tagName === "SELECT") {
    return validateSelect(element);
  }
  return true;
}

function validateText(element) {
  element.classList.remove("input-error");
  element.nextElementSibling.classList.add("hidden");
  if (element.value.length === 0) {
    element.classList.add("input-error");
    element.nextElementSibling.classList.remove("hidden");
    return false;
  }
  return true;
}

function validateSelect(element) {
  element.classList.remove("select-error");
  element.nextElementSibling.classList.add("hidden");
  if (parseInt(element.value) < 0) {
    element.classList.add("select-error");
    element.nextElementSibling.classList.remove("hidden");
    return false;
  }
  return true;
}
