export function parseQueryParams(queryObject) {
  try {

    let sortingArray = []
    if (queryObject?.sort) {
      const sort = queryObject.sort
      const fields = sort.split(",")
      for (let field of fields) {
        const fieldsSorted = field.split(":")
        sortingArray.push([fieldsSorted[0], fieldsSorted[1] ? fieldsSorted[1] : "ASC"])
      }
      delete queryObject["sort"]
    }

    let limit = {}
    let offset = {}
    if (queryObject?.size) {
      limit = {limit: parseInt(queryObject.size)}
      if (queryObject?.page) 
        offset = {offset: parseInt(queryObject.page - 1) * parseInt(queryObject.size)}
      delete queryObject["size"]
    }
    if (queryObject?.page) 
        delete queryObject["page"]

    const filterObject = queryObject
    return { filterObject, sortingArray, limit, offset }
  } catch(error) {
    throw {status: 500, message: error.message}
  }
}