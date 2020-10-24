import i18n from 'i18next';

export default (state, elements) => {
  const { status, error } = state.form;
  const { urlInput, feedback, btn } = elements;

  switch (status) {
    case 'enabled':
      urlInput.disabled = false;
      btn.disabled = false;
      break;
    case 'disabled':
      urlInput.disabled = true;
      btn.disabled = true;
      break;
    case 'invalid':
      urlInput.classList.add('border-danger');
      feedback.className = 'text-danger';
      feedback.textContent = i18n.t(`errors.${error}`);
      break;
    case 'valid':
      btn.disabled = false;
      urlInput.classList.remove('border-danger');
      feedback.textContent = '';
      break;
    default:
      throw new Error(`Unknown form status: ${status}`);
  }
};
