import React from 'react'
import { Notes } from './Notes'

export const Home = (props) => {
 

  return (
    <div>
    <h1>This is Home Page</h1>
    <Notes showAlert={props.showAlert}/>
    </div>
  )
}
