import i18n from 'i18next';

export default (state, elements) => {
  const { status, error } = state.load;
  const { urlInput, feedbackContainer } = elements;

  switch (status) {
    case 'idle':
      break;
    case 'pending':
      feedbackContainer.textContent = i18n.t('alerts.pending');
      feedbackContainer.className = 'text-warning';
      break;
    case 'success':
      urlInput.value = '';
      feedbackContainer.textContent = i18n.t('alerts.success');
      feedbackContainer.className = 'text-success';
      break;
    case 'failed':
      feedbackContainer.className = 'text-danger';
      feedbackContainer.textContent = i18n.t(`errors.${error}`);
      break;
    default:
      throw new Error(`Unknown load status: ${status}`);
  }
};
