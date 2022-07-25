export function parseQueryParams(queryObject) {
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
  const filterObject = queryObject
  return { filterObject, sortingArray }
}