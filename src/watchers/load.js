import i18n from 'i18next';

export default (state, elements) => {
  const { status, error } = state.load;
  const { urlInput, feedback } = elements;

  switch (status) {
    case 'idle':
      break;
    case 'pending':
      feedback.textContent = i18n.t('alerts.pending');
      feedback.className = 'text-warning';
      break;
    case 'success':
      urlInput.value = '';
      feedback.textContent = i18n.t('alerts.success');
      feedback.className = 'text-success';
      break;
    case 'failed':
      feedback.className = 'text-danger';
      feedback.textContent = i18n.t(`errors.${error}`);
      break;
    default:
      throw new Error(`Unknown load status: ${status}`);
  }
};
