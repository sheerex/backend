import * as currencyService from "../services/currency.js"


export async function getCurrencies(req, res) {
  try {
    const currencies = await currencyService.getCurrencies(req.query)
    return res.json(currencies)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function getCurrency(req, res) {
  try {
    req.params.id = parseInt(req.params.id)
    const currency = await currencyService.getCurrency(req.params.id, req.query)
    return res.json(currency)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function createCurrency(req, res) {
  try {
    const currency = await currencyService.createCurrency(req.body)
    return res.status(201).json(currency)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function updateCurrency(req, res) {
  try {
    req.params.id = parseInt(req.params.id)
   
    const currency = await currencyService.updateCurrency({ ...req.body, id: req.params.id })
    return res.status(200).json(currency)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function deleteCurrency(req, res) {
  try {
    const { id } = req.params
    await currencyService.deleteCurrency(id)
    return res.status(204).json({message: `Currency Id ${id} deleted.`})
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}