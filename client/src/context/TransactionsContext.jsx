import React, { createContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'

import { contractABI, contractAddress } from '../utils/constants'

export const TransactionContext = createContext()

const { ethereum } = window

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const transactionContact = new ethers.Contract(contractAddress, contractABI, signer)

  return transactionContact
}

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [formData, setFormData] = useState({
    addressTo: '',
    amount: '',
    keyword: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'))
  const [transactions, setTransactions] = useState()

  const handleChange = (e, name) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: e.target.value
    }))
  }

  const getAllTransaction = async () => {
    try {
      if (!ethereum) {
        return alert('Please install metamask')
      }

      const transactionContract = getEthereumContract()

      const availableTransactions = await transactionContract.getAllTransactions()

      const structuredTransactions = availableTransactions.map((transaction) => ({
        addressTo: transaction.receiver,
        addressFrom: transaction.sender,
        timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
        message: transaction.message,
        keyword: transaction.keyword,
        amount: parseInt(transaction.amount._hex) / (10 ** 18)
      }))

      setTransactions(structuredTransactions)
    } catch (error) {
      console.log(error)
    }
  }

  const checkWelletIsConnnected = async () => {
    try {
      if (!ethereum) {
        return alert('Please install metamask')
      }
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts.length) {
        setCurrentAccount(accounts[0])
        getAllTransaction()
      } else {
        console.log('No account found')
      }
    } catch (error) {
      console.log(error)
      throw new Error("No ethereum object")
    }
  }

  const checkIfTransactionExist = async () => {
    try {
      const transactionContact = getEthereumContract()
      const transactionCount = await transactionContact.getTransactionCount()

      window.localStorage.setItem('transactionCount', transactionCount)
    } catch (error) {
      console.log(error)
      throw new Error("No ethereum object")
    }
  }

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        return alert('Please install metamask')
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
      throw new Error("No ethereum object")
    }
  }

  const sendTransaction = async () => {
    try {
      if (!ethereum) {
        return alert('Please install metamask')
      }

      const { addressTo, amount, keyword, message } = formData
      const transactionContact = getEthereumContract()
      const parseAmount = ethers.utils.parseEther(amount)

      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: currentAccount,
          to: addressTo,
          gas: '0x5208', // 21000 GWEI,
          value: parseAmount._hex, // 0.00001
        }]
      })

      const transactionHash = await transactionContact.addToBlockchain(addressTo, parseAmount, message, keyword)

      setIsLoading(true)
      console.log(`Loading - ${transactionHash.hash}`)
      await transactionHash.wait()
      setIsLoading(false)
      console.log(`Success - ${transactionHash.hash}`)

      const transactionCount = await transactionContact.getTransactionCount()
      setTransactionCount(transactionCount.toNumber())
      getAllTransaction()
    } catch (error) {
      console.log(error)
      throw new Error("No ethereum object")
    }
  }

  useEffect(() => {
    checkWelletIsConnnected()
    checkIfTransactionExist()
  }, [])

  return <TransactionContext.Provider value={{
    connectWallet,
    currentAccount,
    handleChange,
    formData,
    setFormData,
    sendTransaction,
    isLoading,
    transactions
  }}>
    {children}
  </TransactionContext.Provider>
}