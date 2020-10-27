import i18n from 'i18next';

export default (state, elements) => {
  const { status, error } = state.form;
  const { urlInput, feedbackContainer, submitButton } = elements;

  switch (status) {
    case 'enabled':
      urlInput.disabled = false;
      submitButton.disabled = false;
      break;
    case 'disabled':
      urlInput.disabled = true;
      submitButton.disabled = true;
      break;
    case 'invalid':
      urlInput.classList.add('border-danger');
      feedbackContainer.className = 'text-danger';
      feedbackContainer.textContent = i18n.t(`errors.${error}`);
      break;
    case 'valid':
      submitButton.disabled = false;
      urlInput.classList.remove('border-danger');
      feedbackContainer.textContent = '';
      break;
    default:
      throw new Error(`Unknown form status: ${status}`);
  }
};
