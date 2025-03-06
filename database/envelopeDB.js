import * as SQLite from 'expo-sqlite';


 
const DATABASE_NAME ='myenvelope.db';

export async function initDB()  {
  console.log('Database initialized');
 
  try{
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await db.execAsync(`   
      CREATE TABLE IF NOT EXISTS ENVELOPE_TABLE (
                                                  ENV_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  ENV_NAME TEXT,
                                                  DATE_ADDED TEXT); 
      
      CREATE TABLE IF NOT EXISTS INCOME_TABLE (
                                                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                                                COLUMN_INCOME_AMOUNT FLOAT,
                                                COLUMN_INCOME_DATE TEXT,
                                                COLUMN_INCOME_DETAIL TEXT);
      
      CREATE TABLE IF NOT EXISTS ENVELOPE_DETAIL_TABLE (
                                                ENV_DET_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                                                ENV_DETAIL_DESCRIPTION TEXT,
                                                DETAIL_TYPE TEXT,
                                                ENV_AMOUNT FLOAT,
                                                ENV_DATE TEXT,
                                                ENV_ID INTEGER);
      `);
  }catch(e){
    console.error('error!:',e);
  }
  
}

export async function clearAllData() {
  console.log('Clearing all data from tables');
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await db.execAsync('DELETE FROM ENVELOPE_TABLE');
    await db.execAsync('DELETE FROM INCOME_TABLE');
    await db.execAsync('DELETE FROM ENVELOPE_DETAIL_TABLE');
    console.log('All data cleared successfully');
  } catch (e) {
    console.error('Error clearing all data:', e);
    throw e; // Re-throw the error to handle it in the calling function
  }
}



// Function to get the remaining income
// export async function  getRemainingIncome() {
//   // console.log('Fetching remaining income');
//   const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
//   const firstRow = await db.getFirstAsync(`SELECT (SUM(COLUMN_INCOME_AMOUNT) - 
//               IFNULL((SELECT SUM(ENV_AMOUNT) FROM ENVELOPE_DETAIL_TABLE WHERE DETAIL_TYPE = 'Allocated Income'), 0))
//               AS remainingIncome
//               FROM INCOME_TABLE;`);
//   // console.log('result is=>',firstRow.remainingIncome);  
//   return firstRow.remainingIncome;
// }
export async function getRemainingIncome() {
  // console.log('Fetching remaining income');
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    statement = await db.prepareAsync(`SELECT (SUM(COLUMN_INCOME_AMOUNT) - 
              IFNULL((SELECT SUM(ENV_AMOUNT) FROM ENVELOPE_DETAIL_TABLE WHERE DETAIL_TYPE = 'Allocated Income'), 0))
              AS remainingIncome
              FROM INCOME_TABLE;`);
    const result = await statement.executeAsync();
    const firstRow = await result.getFirstAsync();
    // console.log('result is=>', firstRow.remainingIncome);  
    return firstRow.remainingIncome;
  } catch (e) {
    console.error('Error fetching remaining income:', e);
    throw e; // Re-throw the error to handle it in the calling function
  } finally {
    if (statement) {
      await statement.finalizeAsync();
    }
  }
}


// export async function getRemainingAllocation(envId) {
//   const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
//   const firstRow = await db.getFirstAsync(`
//     SELECT (
//                 SUM("ENV_AMOUNT") - 
//                 IFNULL((SELECT SUM(ENV_AMOUNT) FROM ENVELOPE_DETAIL_TABLE WHERE DETAIL_TYPE = 'Expense' AND ENV_ID = ?), 0)
//            ) AS remainingAllocation
//     FROM   ENVELOPE_DETAIL_TABLE WHERE DETAIL_TYPE = 'Allocated Income' AND ENV_ID = ?;
//   `, [envId, envId]); // Pass envId as a parameter to the query
//   // console.log('result is=>', firstRow.remainingAllocation);
//   return firstRow.remainingAllocation;
// }
export async function getRemainingAllocation(envId) {
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    // statement = await db.prepareAsync(`
    //   SELECT (
    //             SUM("ENV_AMOUNT") - 
    //             IFNULL((SELECT SUM(ENV_AMOUNT) FROM ENVELOPE_DETAIL_TABLE WHERE DETAIL_TYPE = 'Expense' AND ENV_ID = ?), 0)
    //        ) AS remainingAllocation
    //   FROM ENVELOPE_DETAIL_TABLE WHERE DETAIL_TYPE = 'Allocated Income' AND ENV_ID = ?;
    // `);
    statement = await db.prepareAsync(`
      SELECT (
                IFNULL(SUM("ENV_AMOUNT"), 0) - 
                IFNULL((SELECT SUM(ENV_AMOUNT) FROM ENVELOPE_DETAIL_TABLE WHERE DETAIL_TYPE = 'Expense' AND ENV_ID = ?), 0)
           ) AS remainingAllocation
      FROM ENVELOPE_DETAIL_TABLE WHERE DETAIL_TYPE = 'Allocated Income' AND ENV_ID = ?;
    `);
    const result = await statement.executeAsync([envId, envId]);
    const firstRow = await result.getFirstAsync();
    // console.log('result is=>', firstRow.remainingAllocation);
    return firstRow.remainingAllocation;
  } catch (e) {
    console.error('Error fetching remaining allocation:', e);
    throw e; // Re-throw the error to handle it in the calling function
  } finally {
    if (statement) {
      await statement.finalizeAsync();
    }
  }
}



// export async function insertEnvelope(envName, dateAdded) {
//     console.log('Envelope Inserted');
    
//     try {
//       const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
//       const result = await db.runAsync('INSERT INTO ENVELOPE_TABLE (ENV_NAME, DATE_ADDED) VALUES (?, ?)', [envName, dateAdded]);
//       console.log(result.lastInsertRowId, result.changes);
//     } catch (e) {
//       console.error('error!:', e);
//     }
//   }
export async function insertEnvelope(envName, dateAdded) {
  console.log('Envelope Inserted');
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    statement = await db.prepareAsync('INSERT INTO ENVELOPE_TABLE (ENV_NAME, DATE_ADDED) VALUES (?, ?)');
    const result = await statement.executeAsync([envName, dateAdded]);
    console.log(result.lastInsertRowId, result.changes);
  } catch (e) {
    console.error('error!:', e);
    throw e; // Re-throw the error to handle it in the calling function
  } finally {
    if (statement) {
      await statement.finalizeAsync();
    }
  }
}


export async function ImportinsertEnvelope(id,envName, dateAdded) {
  console.log('Envelope Inserted');
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    statement = await db.prepareAsync('INSERT INTO ENVELOPE_TABLE (ENV_ID,ENV_NAME, DATE_ADDED) VALUES (?, ?, ?)');
    const result = await statement.executeAsync([id,envName, dateAdded]);
    console.log(result.lastInsertRowId, result.changes);
  } catch (e) {
    console.error('error!:', e);
    throw e; // Re-throw the error to handle it in the calling function
  } finally {
    if (statement) {
      await statement.finalizeAsync();
    }
  }
}


  // export async function selectEnvelope() {
  //   console.log('Fetching list of envelopes');
    
  //   try {
  //     const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  //     const allRows = await db.getAllAsync('SELECT * FROM ENVELOPE_TABLE');
      
  //     const envelopes = allRows.map(row => ({
  //       id: row.ENV_ID,
  //       name: row.ENV_NAME,
  //       dateAdded: row.DATE_ADDED,
  //     }));
      
  //     return envelopes;
  //   } catch (e) {
  //     console.error('Error fetching envelopes:', e);
  //     throw e; // Re-throw the error to handle it in the calling function
  //   }
  // }
  export async function selectEnvelope() {
    console.log('Fetching list of envelopes');
    let statement;
    try {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      statement = await db.prepareAsync('SELECT * FROM ENVELOPE_TABLE');
      const result = await statement.executeAsync();
      
      const allRows = await result.getAllAsync();
      const envelopes = allRows.map(row => ({
        id: row.ENV_ID,
        name: row.ENV_NAME,
        dateAdded: row.DATE_ADDED,
      }));
      
      return envelopes;
    } catch (e) {
      console.error('Error fetching envelopes:', e);
      throw e; // Re-throw the error to handle it in the calling function
    } finally {
      if (statement) {
        await statement.finalizeAsync();
      }
    }
  }


  // export async function updateEnvelope(env_id, newTitle) {
  //   console.log('updateEnvelope');
   
  //   try{
  //     const db = await SQLite.openDatabaseAsync(DATABASE_NAME); 
  
  //     await db.runAsync('UPDATE ENVELOPE_TABLE SET ENV_NAME = ? WHERE ENV_ID = ?', [newTitle, env_id]);
       
      
  //   }catch(e){
  //     console.error('error!:',e);
  //   }
    
  // }
  export async function updateEnvelope(env_id, newTitle) {
    console.log('updateEnvelope');
    let statement;
    try {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      statement = await db.prepareAsync('UPDATE ENVELOPE_TABLE SET ENV_NAME = ? WHERE ENV_ID = ?');
      await statement.executeAsync([newTitle, env_id]);
    } catch (e) {
      console.error('error!:', e);
      throw e; // Re-throw the error to handle it in the calling function
    } finally {
      if (statement) {
        await statement.finalizeAsync();
      }
    }
  }


  // export async function deleteEnvelope (ENV_ID) {
  //   console.log('deleteEnvelope');
   
  //   try{
  //     const db = await SQLite.openDatabaseAsync(DATABASE_NAME);       
  //     await db.runAsync('DELETE FROM ENVELOPE_TABLE WHERE ENV_ID = ?', [ENV_ID]);
      
  //   }catch(e){
  //     console.error('error!:',e);
  //   }
    
  // }
  export async function deleteEnvelope(ENV_ID) {
    console.log('deleteEnvelope');
    let statement;
    try {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      statement = await db.prepareAsync('DELETE FROM ENVELOPE_TABLE WHERE ENV_ID = ?');
      await statement.executeAsync([ENV_ID]);
    } catch (e) {
      console.error('error!:', e);
      throw e; // Re-throw the error to handle it in the calling function
    } finally {
      if (statement) {
        await statement.finalizeAsync();
      }
    }
  }


//-------------------------- CRUD operations for INCOME_TABLE
// export async function insertIncome(amount, date, detail) {
//   console.log('Income Inserted');

//   try {
//     const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
//     const result = await db.runAsync('INSERT INTO INCOME_TABLE (COLUMN_INCOME_AMOUNT, COLUMN_INCOME_DATE, COLUMN_INCOME_DETAIL) VALUES (?, ?, ?)', [amount, date, detail]);
//     console.log(result.lastInsertRowId, result.changes);
//   } catch (e) {
//     console.error('error!:', e);
//   }
// }
export async function insertIncome(amount, date, detail) {
  console.log('Income Inserted');
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    statement = await db.prepareAsync('INSERT INTO INCOME_TABLE (COLUMN_INCOME_AMOUNT, COLUMN_INCOME_DATE, COLUMN_INCOME_DETAIL) VALUES (?, ?, ?)');
    const result = await statement.executeAsync([amount, date, detail]);
    console.log(result.lastInsertRowId, result.changes);
  } catch (e) {
    console.error('error!:', e);
    throw e; // Re-throw the error to handle it in the calling function
  } finally {
    if (statement) {
      await statement.finalizeAsync();
    }
  }
}

// export async function selectIncome() {
//   console.log('Fetching list of incomes');

//   try {
//     const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
//     const allRows = await db.getAllAsync('SELECT * FROM INCOME_TABLE');

//     const incomes = allRows.map(row => ({
//       id: row.ID,
//       amount: row.COLUMN_INCOME_AMOUNT,
//       date: row.COLUMN_INCOME_DATE,
//       detail: row.COLUMN_INCOME_DETAIL,
//     }));

//     return incomes;
//   } catch (e) {
//     console.error('Error fetching incomes:', e);
//     throw e; // Re-throw the error to handle it in the calling function
//   }
// }
export async function selectIncome() {
  console.log('Fetching list of incomes');
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    statement = await db.prepareAsync('SELECT * FROM INCOME_TABLE');
    const result = await statement.executeAsync();
    const allRows = await result.getAllAsync();

    const incomes = allRows.map(row => ({
      id: row.ID,
      amount: row.COLUMN_INCOME_AMOUNT,
      date: row.COLUMN_INCOME_DATE,
      detail: row.COLUMN_INCOME_DETAIL,
    }));

    return incomes;
  } catch (e) {
    console.error('Error fetching incomes:', e);
    throw e; // Re-throw the error to handle it in the calling function
  } finally {
    if (statement) {
      await statement.finalizeAsync();
    }
  }
}

// export async function updateIncome(id, amount, date, detail) {
//   console.log('updateIncome');

//   try {
//     const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
//     await db.runAsync('UPDATE INCOME_TABLE SET COLUMN_INCOME_AMOUNT = ?, COLUMN_INCOME_DATE = ?, COLUMN_INCOME_DETAIL = ? WHERE ID = ?', [amount, date, detail, id]);
//   } catch (e) {
//     console.error('error!:', e);
//   }
// }
export async function updateIncome(id, amount, date, detail) {
  console.log('updateIncome');
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    statement = await db.prepareAsync('UPDATE INCOME_TABLE SET COLUMN_INCOME_AMOUNT = ?, COLUMN_INCOME_DATE = ?, COLUMN_INCOME_DETAIL = ? WHERE ID = ?');
    await statement.executeAsync([amount, date, detail, id]);
  } catch (e) {
    console.error('error!:', e);
    throw e; // Re-throw the error to handle it in the calling function
  } finally {
    if (statement) {
      await statement.finalizeAsync();
    }
  }
}

// export async function deleteIncome(id) {
//   console.log('deleteIncome');

//   try {
//     const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
//     await db.runAsync('DELETE FROM INCOME_TABLE WHERE ID = ?', [id]);
//   } catch (e) {
//     console.error('error!:', e);
//   }
// }
export async function deleteIncome(id) {
  console.log('deleteIncome');
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    statement = await db.prepareAsync('DELETE FROM INCOME_TABLE WHERE ID = ?');
    await statement.executeAsync([id]);
  } catch (e) {
    console.error('error!:', e);
    throw e; // Re-throw the error to handle it in the calling function
  } finally {
    if (statement) {
      await statement.finalizeAsync();
    }
  }
}

//-------------------------- CRUD operations for ENVELOPE_DETAIL_TABLE
// export async function insertEnvelopeDetail(description, type, amount, date, envId) {
//   console.log('Envelope Detail Inserted');

//   try {
//     const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
//     const result = await db.runAsync('INSERT INTO ENVELOPE_DETAIL_TABLE (ENV_DETAIL_DESCRIPTION, DETAIL_TYPE, ENV_AMOUNT, ENV_DATE, ENV_ID) VALUES (?, ?, ?, ?, ?)', [description, type, amount, date, envId]);
//     console.log(result.lastInsertRowId, result.changes);
//   } catch (e) {
//     console.error('error!:', e);
//   }
// }


export async function insertEnvelopeDetail(description, type, amount, date, envId) {
  console.log('Envelope Detail Inserted');
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    statement = await db.prepareAsync('INSERT INTO ENVELOPE_DETAIL_TABLE (ENV_DETAIL_DESCRIPTION, DETAIL_TYPE, ENV_AMOUNT, ENV_DATE, ENV_ID) VALUES (?, ?, ?, ?, ?)');
    const result = await statement.executeAsync([description, type, amount, date, envId]);
    console.log(result.lastInsertRowId, result.changes);
  } catch (e) {
    console.error('error!:', e);
    throw e; // Re-throw the error to handle it in the calling function
  } finally {
    if (statement) {
      await statement.finalizeAsync();
    }
  }
}

// export async function selectEnvelopeDetail(envId) {
//   console.log('Fetching list of envelope details for ENV_ID:', envId);

//   try {
//     const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
//     const allRows = await db.getAllAsync('SELECT * FROM ENVELOPE_DETAIL_TABLE WHERE ENV_ID = ?', [envId]);

//     const envelopeDetails = allRows.map(row => ({
//       id: row.ENV_DET_ID,
//       description: row.ENV_DETAIL_DESCRIPTION,
//       type: row.DETAIL_TYPE,
//       amount: row.ENV_AMOUNT,
//       date: row.ENV_DATE,
//       envId: row.ENV_ID,
//     }));

//     return envelopeDetails;
//   } catch (e) {
//     console.error('Error fetching envelope details:', e);
//     throw e; // Re-throw the error to handle it in the calling function
//   }
// }
export async function selectEnvelopeDetail(envId) {
  console.log('Fetching list of envelope details for ENV_ID:', envId);
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    statement = await db.prepareAsync('SELECT * FROM ENVELOPE_DETAIL_TABLE WHERE ENV_ID = ?');
    const result = await statement.executeAsync([envId]);
    const allRows = await result.getAllAsync();

    const envelopeDetails = allRows.map(row => ({
      id: row.ENV_DET_ID,
      description: row.ENV_DETAIL_DESCRIPTION,
      type: row.DETAIL_TYPE,
      amount: row.ENV_AMOUNT,
      date: row.ENV_DATE,
      envId: row.ENV_ID,
    }));

    return envelopeDetails;
  } catch (e) {
    console.error('Error fetching envelope details:', e);
    throw e; // Re-throw the error to handle it in the calling function
  } finally {
    if (statement) {
      await statement.finalizeAsync();
    }
  }
}



export async function selectAllEnvelopeDetails() {
  console.log('Fetching all envelope details');
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    statement = await db.prepareAsync('SELECT * FROM ENVELOPE_DETAIL_TABLE');
    const result = await statement.executeAsync();
    const allRows = await result.getAllAsync();

    const envelopeDetails = allRows.map(row => ({
      id: row.ENV_DET_ID,
      description: row.ENV_DETAIL_DESCRIPTION,
      type: row.DETAIL_TYPE,
      amount: row.ENV_AMOUNT,
      date: row.ENV_DATE,
      envId: row.ENV_ID,
    }));

    return envelopeDetails;
  } catch (e) {
    console.error('Error fetching all envelope details:', e);
    throw e; // Re-throw the error to handle it in the calling function
  } finally {
    if (statement) {
      await statement.finalizeAsync();
    }
  }
}



// export async function updateEnvelopeDetail(id, description, type, amount, date) {
//   console.log('updateEnvelopeDetail');

//   try {
//     const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
//     await db.runAsync('UPDATE ENVELOPE_DETAIL_TABLE SET ENV_DETAIL_DESCRIPTION = ?, DETAIL_TYPE = ?, ENV_AMOUNT = ?, ENV_DATE = ? WHERE ENV_DET_ID = ?', [description, type, amount, date, id]);
//   } catch (e) {
//     console.error('error!:', e);
//   }
// }
export async function updateEnvelopeDetail(id, description, type, amount, date) {
  console.log('updateEnvelopeDetail');
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    statement = await db.prepareAsync('UPDATE ENVELOPE_DETAIL_TABLE SET ENV_DETAIL_DESCRIPTION = ?, DETAIL_TYPE = ?, ENV_AMOUNT = ?, ENV_DATE = ? WHERE ENV_DET_ID = ?');
    await statement.executeAsync([description, type, amount, date, id]);
  } catch (e) {
    console.error('error!:', e);
    throw e; // Re-throw the error to handle it in the calling function
  } finally {
    if (statement) {
      await statement.finalizeAsync();
    }
  }
}

// export async function deleteEnvelopeDetail(id) {
//   console.log('deleteEnvelopeDetail');

//   try {
//     const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
//     await db.runAsync('DELETE FROM ENVELOPE_DETAIL_TABLE WHERE ENV_DET_ID = ?', [id]);
//   } catch (e) {
//     console.error('error!:', e);
//   }
// }
export async function deleteEnvelopeDetail(id) {
  console.log('deleteEnvelopeDetail');
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    statement = await db.prepareAsync('DELETE FROM ENVELOPE_DETAIL_TABLE WHERE ENV_DET_ID = ?');
    await statement.executeAsync([id]);
  } catch (e) {
    console.error('error!:', e);
    throw e; // Re-throw the error to handle it in the calling function
  } finally {
    if (statement) {
      await statement.finalizeAsync();
    }
  }
}


// export async function deleteEnvelopeDetailByENV_ID(id) {
//   console.log('deleteEnvelopeDetail');

//   try {
//     const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
//     await db.runAsync('DELETE FROM ENVELOPE_DETAIL_TABLE WHERE ENV_ID = ?', [id]);
//   } catch (e) {
//     console.error('error!:', e);
//   }
// }
export async function deleteEnvelopeDetailByENV_ID(id) {
  console.log('deleteEnvelopeDetail');
  let statement;
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    statement = await db.prepareAsync('DELETE FROM ENVELOPE_DETAIL_TABLE WHERE ENV_ID = ?');
    await statement.executeAsync([id]);
  } catch (e) {
    console.error('error!:', e);
    throw e; // Re-throw the error to handle it in the calling function
  } finally {
    if (statement) {
      await statement.finalizeAsync();
    }
  }
}






