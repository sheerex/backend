import * as networkService from "../services/network.js"


export async function getNetworks(req, res) {
  try {
    const networks = await networkService.getNetworks(req.query)
    return res.json(networks)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function getNetwork(req, res) {
  try {
    req.params.id = parseInt(req.params.id)
    const network = await networkService.getNetwork(req.params.id, req.query)
    return res.json(network)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function createNetwork(req, res) {
  try {
    const network = await networkService.createNetwork(req.body)
    return res.status(201).json(network)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function updateNetwork(req, res) {
  try {
    req.params.id = parseInt(req.params.id)
   
    const network = await networkService.updateNetwork({ ...req.body, id: req.params.id })
    return res.status(200).json(network)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function deleteNetwork(req, res) {
  try {
    const { id } = req.params
    await networkService.deleteNetwork(id)
    return res.status(204).json({message: `Network Id ${id} deleted.`})
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}