export function fieldsDefined(req, arrayFields) {
  let list = ""
  for (let field of arrayFields) {
    if (req.body[field] != null)
     list += field + ','
  }
  return list.slice(0, -1)
}