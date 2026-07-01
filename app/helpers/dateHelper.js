/**
 * Date Helper Functions
 * Provides consistent date formatting across the application
 */

/**
 * Format date to Indonesian locale
 * @param {Date|string|null} date - Date to format
 * @returns {string} Formatted date string or "-" if null/undefined
 */
function formatDate(date) {
    if (!date) {
        return '-';
    }
    
    try {
        const dateObj = new Date(date);
        
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return '-';
        }
        
        return dateObj.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
}

/**
 * Format date and time to Indonesian locale
 * @param {Date|string|null} date - Date to format
 * @returns {string} Formatted datetime string or "-" if null/undefined
 */
function formatDateTime(date) {
    if (!date) {
        return '-';
    }
    
    try {
        const dateObj = new Date(date);
        
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return '-';
        }
        
        return dateObj.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting datetime:', error);
        return '-';
    }
}

module.exports = {
    formatDate,
    formatDateTime
};
