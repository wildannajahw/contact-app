import Head from 'next/head'
import { Inter } from 'next/font/google'
import { GET_CONTACT_LIST } from '@/query'
import { useQuery } from '@apollo/client'
import { type ContactList } from '@/types/contact'
import { useDispatch, useSelector } from '@/redux/store'
import { addFavorit, deleteFavorit } from '@/redux/slices/favorit'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const dispatch = useDispatch()
  const favoritIds = useSelector((state) => state.favorit.contactIds)
  const search = ''

  const contactConditions = {
    _or: [
      { first_name: { _ilike: `%${search}%` } },
      { last_name: { _ilike: `%${search}%` } },
      { phones: { number: { _ilike: `%${search}%` } } }
    ]
  }

  const favoriteContactConditions = {
    ...contactConditions,
    id: { _in: favoritIds }
  }

  const regularContactConditions = {
    ...contactConditions,
    id: { _nin: favoritIds }
  }

  const { loading, error, data, refetch } = useQuery<ContactList>(GET_CONTACT_LIST, {
    variables: {
      limit: 10,
      offset: 0,
      order_by: { created_at: 'asc' },
      where_favorit: favoriteContactConditions,
      where_regular: regularContactConditions
    },
    notifyOnNetworkStatusChange: true
  })

  useEffect(() => {
    const refetching = async () => {
      try {
        await refetch()
      } catch (error) {
        console.error('Error refetching:', error)
      }
    }
    void refetching()
  }, [error, favoritIds, refetch])

  if (loading) return <p>Loading...</p>

  if (error != null) return <p>Error: {error.message}</p>

  const handleDeleteFavorit = (contact: number) => {
    try {
      dispatch(deleteFavorit(contact))
    } catch (error) {
      console.error('Error deleting favorit:', error)
    }
  }

  const handleAddFavorit = (contact: number) => {
    try {
      dispatch(addFavorit(contact))
    } catch (error) {
      console.error('Error adding favorit:', error)
    }
  }
  const { favorit, regular } = data ?? { favorit: [], regular: [] }
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${inter.className}`}>
        <div>favorit:</div>
        {favorit.map(({ id, first_name }) => (
          <div key={id}>
            {id}
            {first_name}
            <button
              onClick={() => {
                handleDeleteFavorit(id)
              }}
            >
              Delete button
            </button>
          </div>
        ))}
        <div>regular:</div>
        {regular.map(({ id, first_name }) => (
          <div key={id}>
            {id}
            {first_name}
            <button
              onClick={() => {
                handleAddFavorit(id)
              }}
            >
              Add button
            </button>
          </div>
        ))}
      </main>
    </>
  )
}
