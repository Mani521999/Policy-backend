/** values are empty or not */
export const isEmpty = value =>
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0) ||
    (typeof value === 'number' && value !== 0 && value.length === 0);



/** values are empty or not */
export const sendResponse = (res, data = {}) => {
    res.status(data.statusCode).json(data)
}


/** Create pagination query for all apis  */
export const paginationQuery = (query = {}) => {
    try {

        let pagination = { skip: 0, limit: 10, page: 1 }

        if (!isEmpty(query) && !isEmpty(query.page) && !isEmpty(query.limit)) {
            pagination['skip'] = (query.page - 1) * query.limit;
            pagination['limit'] = Number(query.limit)
            pagination['page'] = Number(query.page)
        }

        return pagination;
    } catch (e) {
        console.log("paginationQuery_err", e);
        return  { skip: 0, limit: 10, page: 1 }
    }
}