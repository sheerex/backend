import * as parameterService from "../services/parameter.js"

export async function getParameters(req, res) {
  try {
    console.log(req.query)
    const result = await parameterService.getParameters(req.query)
    return res.json(result)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function updateParameter(req, res) {
  try {
    const { id } = req.params
    const parameter = await parameterService.updateParameter({id, ...req.body})
    return res.status(200).json(parameter)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

