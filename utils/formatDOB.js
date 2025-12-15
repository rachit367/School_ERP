function formatDOB(date) {
    if (!date) return '';
    return date.toISOString().split('T')[0];
}