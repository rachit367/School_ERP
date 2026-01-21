function formatDOB(date) {
    if (!date) return '';
    return date.toISOString().split('T')[0];
}

module.exports={formatDOB}