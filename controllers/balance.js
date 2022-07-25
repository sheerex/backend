import * as balanceService from "../services/balance.js"
import { checkUserAccess } from "../helpers/validations.js"


export async function getBalances(req, res) {
  try {
    const balances = await balanceService.getBalances(req.query)
    return res.json(balances)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function getBalance(req, res) {
  try {
    req.params.id = parseInt(req.params.id)
    await checkUserAccess(req.params.id, req.user.id, "User is not Admin and can only get its own balance.")

    const user = await userService.getBalance(req.params.id, req.query)
    return res.json(user)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}