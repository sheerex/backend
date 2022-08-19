import * as userService from "../services/user.js"
import { fieldsDefined } from "../helpers/objects.js"
import { checkUserAccess } from "../helpers/validations.js"

export async function getUsers(req, res) {
  try {
    const users = await userService.getUsers(req.query)
    return res.json(users)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function getUser(req, res) {
  try {
    req.params.id = parseInt(req.params.id)
    await checkUserAccess(req.params.id, req.user.id, "User is not Admin and can only get its own profile.")
    
    const user = await userService.getUser(req.params.id, req.url.includes("balances"), req.url.includes("orders"), req.query)
    return res.json(user)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function createUser(req, res) {
  try {
    const user = await userService.createUser(req.body)
    return res.status(201).json(user)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function updateUser(req, res) {
  try {
    req.params.id = parseInt(req.params.id)
    const isAdmin = await checkUserAccess(req.params.id, req.user.id, "User is not Admin and can only get its own profile.")

    if (!isAdmin) {
      const listFieldsDefine = fieldsDefined(req, ["active","verified", "noVerified"])
      if (listFieldsDefine)
        return res.status(403).send({message: `User is not Admin and can not update ${listFieldsDefine}.`})
    }

    const user = await userService.updateUser({ ...req.body, id: req.params.id })
    return res.json(user);
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function deleteUser(req, res) {
  try {
    await userService.deleteUser(req.params.id)
    return res.status(204).json({message: `User Id ${id} deleted.`})
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function login(req, res) {
  try {
    const token = await userService.login(req.body)
    return res.status(200).json(token)
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function changePassword(req, res) {
  try {
    req.params.id = parseInt(req.params.id)
    await checkUserAccess(req.params.id, req.user.id, "User is not Admin and can only get its own profile.")

    await userService.changePassword({ id: req.params.id, ...req.body})
    return res.status(200).json({message: "Password changed."})
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function verifyEmail(req, res) {
  try {
    const verificationCode = parseInt(req.params.verificationCode)
    await userService.verifyEmail(verificationCode)
    return res.status(200).json({message: "User verified."})
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function resendVerificationCode(req, res) {
  try {
    await userService.resendVerificationCode(req.params.email)
    return res.status(200).json({message: "Verification Code resend."})
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function sendResetPassword(req, res) {
  try {
    await userService.sendResetPassword(req.params.email)
    return res.status(200).json({message: "Password reset link sent."})
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}

export async function resetPassword(req, res) {
  try {
    await userService.resetPassword(req.params.token)
    return res.status(200).json({message: "Password reseted."})
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || error})
  }
}