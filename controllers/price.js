import * as priceService from "../services/price.js"

export async function getPrices(req, res) {
  try {
    const prices = await priceService.getPrices(req.query)
    return res.json(prices)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function getPrice(req, res) {
  try {
    req.params.id = parseInt(req.params.id)
    const price = await priceService.getPrice(req.params.id, req.query)
    return res.json(price)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function getPriceByCurrencies(req, res) {
  try {
    req.params.id = parseInt(req.params.id)
    req.params.id2 = parseInt(req.params.id2)
    const price = await priceService.getPriceByCurrencies(req.params.id, req.params.id2)
    return res.json(price)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function createPrice(req, res) {
  try {
    const price = await priceService.createPrice(req.body)
    return res.status(201).json(price)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function updatePrice(req, res) {
  try {
    req.params.id = parseInt(req.params.id)
    const price = await priceService.updatePrice({ ...req.body, id: req.params.id })
    return res.status(200).json(price)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function deletePrice(req, res) {
  try {
    const { id } = req.params
    await priceService.deletePrice(id)
    return res.status(204).json({message: `Price Id ${id} deleted.`})
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}