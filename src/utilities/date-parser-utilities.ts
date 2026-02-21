import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const supportedFormats = [
    'YYYY-MM-DD',
    'DD-MM-YYYY',
    'MM/DD/YYYY',
    'YYYY/MM/DD',
    'DD/MM/YYYY',
    'MMM D, YYYY',
    'MMM D YYYY',
    'D MMM YYYY'
];

export const parseDate = (date: string): Date => {
    let parsedDate = supportedFormats
        .map(format => dayjs(date.trim(), format, true))
        .find(d => d.isValid());

    return parsedDate ? parsedDate.toDate() : new Date(date.trim());
}