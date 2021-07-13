## 1. What is join?
JOIN clause is used to combine data/rows from two or more tables based on a common field between them (or a join-predicate)

There are 6 types of join:
- ```INNER JOIN``` selects all rows that have matching values in both tables
- ```LEFT OUTER JOIN (LEFT JOIN)``` selects all rows on the left table and matching rows on the right table. If there is no matching rows on the right table, then the result will contain NULL
- ```RIGHT OUTER JOIN (RIGHT JOIN)``` is similar to LEFT JOIN. This join selects all rows on the right table and matching rows on the left table. If there is no matching row on the left table, then the result will contain NULL
- ```FULL OUTER JOIN (FULL JOIN)```: is the join that combine result of LEFT JOIN and RIGHT JOIN. This join selects all rows from both tables. The rows which there is no maching, the result will contain NULL
- ```SELF JOIN```: is a regular JOIN (inner, left, right, outer), but the table is joined with itself
- ```CROSS JOIN```: this join combines each row from the first table with each row from the second table. In other words, cross join returns a Cartesian product of rows from both tables. This join doesnt establish any relationship between two tables

## 2. UNION, INTERSECT, EXCEPT
```UNION``` operator is used to combine the results of two or more select statements, and it removes duplicated rows. If we want to keep duplicates, we could use ```UNION ALL ``` operator
- Every select statement with UNION must have the same number of columns
- The columns must have similar data types and have the same order

Compare UNION vs UNION ALL: with UNION, SQL engine need an additional Sort operator to remove duplicate values, and we could see this operator is quite expensive (it takes 79% of overall query cost). So in case of we know for sure that there is no duplicate values, we should use ```UNION ALL```

![union-vs-union-all](https://user-images.githubusercontent.com/26838239/122018012-accca200-cdec-11eb-8686-b5a05f442409.jpg)  
(Ref: http://www.sqlviet.com/blog/union-hay-union-all)

```INTERSECT``` operator selects elements that are present in both sets (a set could be a result from a select statement). It is similar to INNER JOIN table

```EXCEPT```: set1 EXCEPT set2 will select all elements that are present in set1 and NOT present in set2. (It is similar to:
  A LEFT JOIN B ON A.key = B.key WHERE B.key IS NULL)

## 3. GROUP BY
```GROUP BY``` statement is used to group rows that have the same values into a summary row, usually it is used in conjuntion with aggregate functions.  
Example: count number of employees in each department

## 4. HAVING
The ```HAVING``` clause specifies conditions to filter group records. These records usually are the result of GROUP BY clause and aggregate function, and WHERE clause cannot be used with aggregate functions

## 5. SELECT INTO
The ```SELECT INTO``` statement copies data from one table into a NEW table. That means it will create a new table before inserting data into it. Here is the syntax:
```sql
SELECT *
INTO newtable [IN externaldb]
FROM oldtable
WHERE condition;
```

## 6. INSERT INTO SELECT
The ```INSERT INTO SELECT``` statement copies data from one table into another EXISTING table. Here is the syntax:
```sql
INSERT INTO table2
SELECT * FROM table1
WHERE condition;
```

## 7. Constraint
SQL constraints are used to specify rules for data in a table. Constraints can be specified when the table is created (using CREATE TABLE) or after the table is created (using ALTER TABLE)

### 7.1. NOT NULL constraint
By default, a column can hold NULL value, the NOT NULL constraint enforces a column to NOT accept NULL value

### 7.2. UNIQUE constraint
The UNIQUE constraint ensures that all values in a column are different

### 7.3. PRIMARY KEY constraint
The PRIMARY KEY constraint is used to identify uniquely each row in a table
- Primary key is a field, or multiple fields that identify each row in a table
- Primary key must contain unique values and cannot contain NULL value

### 7.4 FOREIGN KEY constraint
The FOREIGN KEY constraint is used to link two tables together.  
Foreign key is a field (or multple fields) in one table that refers to another table's primary key

### 7.5. CHECK Constraint
The CHECK Constraint is used to limit the value range in a column.  
Example: we have an Employee table and we want to limit value range on date_of_birth column, such as every employee must be born after 1930 and at least 18 years old, we could use CHECK constraint to do that:
```sql
CONSTRAINT CK_employee_birthdate CHECK([BirthDate]>='1930-01-01' AND [BirthDate]<=dateadd(year,(-18),getdate()))
```

### 7.6. DEFAULT constraint
The DEFAULT constraint is used to set a default value for a column

## 8. VIEW
A view is a SQL query stored in the database with an associated name that allow us to refer to it later. When we call the view, the source table's 'definition is substituted in the main query and the execution will be like reading from these tables directly

## 9. Index
### 9.1. What is index?
An index is a special data structure (B-tree) associated with table/view that helps to speed up the the retrieval of rows

### 9.2. Types of index:
- Clustered index: defines the order of data physically in a table
  + Each table can have only 1 clustered index, because data can be physically stored and sorted in only one way
  + A table that has a clustered index is called clustered table, otherwise, it is called a heap
  + Clustered index is a B-tree, and leaf nodes contain real data of table
  + Queries that contain the clustered index key columns in WHERE clause will be sped up
  + When we search data on column that has clustered index, we can get the result directly on B-tree. Searching data on column that has non-clustered index is different. Firstly, database engine will search on B-tree of non-clustered index to find the clustered index key, then it will continue searching on B-tree of clustered index
  + Disadvantages: using index can slow down DML queries (INSERT, UPDATE, DELETE)
  + How to create:
  ```sql
  -- when we create a primary key, database engine automatically creates a clustered index based on that PK column:
  ALTER TABLE Person
  ADD PRIMARY KEY(person_id);
  
  -- Or we could create clustered index directly:
  CREATE CLUSTERED INDEX ix_person_id
  ON Person(person_id);
  ```

- Non-clustered index: is a B-tree structure that seperates from table and improves the speed of query
  + A table may have one or more nonn-clustered indexes, each non-clustered index can contain one or more columns
  + In non-clustered index B-tree, leaf nodes point to clustered-index keys (with clustered table), or the rows of the table (if table doesnt contain clustered index)
  + VD:
  CREATE [NONCLUSTERED] INDEX ix_customers_city -- NONCLUSTERED is optional
  ON sales.customers(city);

- Unique index: a unique index ensures the index key columns do not contain any duplicate values:
CREATE UNIQUE INDEX ix_person_email 
ON Person(email);
  + Unique index and UNIQUE constraint are similar, both of them ensure there is no duplicate values on a column
  + When we create a unique constraint, SQL engine will create an Unique index associated with this constraint

- Index with included columns (covering index): when we include non-key columns in the non-clustered index, SQL engine will reduce key lookup operator because all columns in the query are included in the index. Type of covering index:
  + Fully covering index: include all non-key columns, ex:
  ```sql
  CREATE NONCLUSTERED INDEX IDX_Employees_Covering
  ON Employees (DepartmentId,PositionId)
  INCLUDE (FirstName,LastName,Birthdate,ManagerId,Salary,Address,City,State,HiredDate);
  ```
  + Partially covering index: include several non-key columns (not all), ex:
  ```sql
  CREATE NONCLUSTERED INDEX IDX_Employees_PartiallyCovering
  ON Employees (DepartmentId,PositionId) 
  INCLUDE (FirstName,LastName,email);
  ```

With covering index, it takes more time to insert new records than non-covering index, but SELECT query performance are better
```sql
CREATE INDEX ix_cust_email_inc
ON sales.customers(email)
INCLUDE(first_name, last_name);

-- So the following query will not contain key lookup operator (because we included first_name, last_name column on index)
SELECT first_name, last_name, email
FROM sales.customers
WHERE email = 'aide.franco@msn.com';
```

- Filtered index: A filtered index is a non-clustered index with a predicate that allows us to specify which rows should be added to the index. For example, when the values in a column are mostly NULL and the query selects only from the non-NULL values, we can create a filtered index for the non-NULL data rows
  + A well-designed filtered index can improve query performance as well as reduce index maintenance and storage costs compared with full-table indexes.
  + Ex:
  ```sql
  CREATE INDEX ix_cust_phone
  ON sales.customers(phone)
  WHERE phone IS NOT NULL; -- this is filtered predicate
  ```

- Index on Computed Columns: is an index that is created on a computed column. Ex:
```sql
-- The following query cannot use index seek, but instead, SQL engine will use index scan:
SELECT FirstName FROM Person where FirstName LIKE 'K%'

-- first, create an computed column:
ALTER TABLE Person ADD FirstName_Left AS LEFT(FirstName, 1)

-- Then creata an index on that column:
CREATE INDEX idx_LeftFirstName
ON Person(FirstName_Left)
```

### 9.3. What is heap?
  + A heap is a table without a clustered index
  + One or more non-clustered indexes can be created on this table
  + Data is stored in heap without specifying an order, so when we SELECT data, we should use ORDER BY clause to guarantee the order of rows returned

- When to use heap?
In heap, data is inserted faster than clustered index table
=> Heap can be used in case of log or audit table, where new data is constantly being inserted. With heap structure, there is no need for SQL engine to figure out where to insert new data.
Heap can be used in another case, when we intend to return almost entire table content

-  When not to use heap?
  + Do not use a heap when the data is frequently returned in a sorted order. A clustered index on the sorting column could avoid the sorting operation.
  + If a heap doenst have any non-clustered index, then the entire table must be scanned in order to find a row
    => Do not use heap when there is no non-clustered index, unless you intend to return the entire table content without any specified order
  + Do not use a heap if the data is frequently updated, because it needs to re-build the heap after updating a row

## 10. Stored procedure 
Stored procedure is an object that stores one or group of sql statements. In other words, stored procedure is a prepared SQL code that can be reused over and over again. Stored procedure can accept the parameters and return a result set

Advantages:
- Easy to modify without the need to restart or re-deploy the application (Backend)
- Reduced network traffic: application only need to pass procedure name (and params) over the network instead of the whole SQL statements
- Reusable: procedure can be executed by multiple users or multiple applications
- Povides better security: procedure helps to eliminate direct access to tables in database. We can also encrypt procedure while creating them so the code inside the stored procedure is not visble, ex:
```sql
--- Database AdventureWorks2019
CREATE PROCEDURE getStoreNames(@BusinessEntityID INT = 1)
WITH ENCRYPTION AS
BEGIN
    SET NOCOUNT ON
    SELECT s.BusinessEntityID, s.Name
    FROM Sales.Store s
    WHERE s.BusinessEntityID = @BusinessEntityID
END
```

Drawbacks
- Difficult to test: business logic which is encapsulated in stored procedures becomes very difficult to test, because there is no way to clearly separate the domain logic from the actual data (which means we cannot using mocking data for testing) (ko thể test trên data mock, vì procedure chỉ có thể test với data thật trong db)
- Difficult to debug: we could use SQL Profiler and print statements for debugging, but it's not so easy
- There is no versioning and history: there is nothing inside procedure which tells us which version stored procedure is on, and there isn't any change being made after procedure has been modified
- Runtime Validation: procedure error only occurs when we execute the script (such as: missing permission to execute a stored procedure, or syntax error...). Any data errors in handling stored procedures are not generated until runtime
- ...

## 11. TRIGGER
- Triggers are special stored procedures that are executed automatically when a database event occurs.
- 3 types of trigger:
  + DML triggers: are invoked automatically whenever an INSERT, UPDATE, DELETE event occurs
  + DDL triggers: are invoked automatically whenever a CREATE, ALTER, DROP event occurs
  + Logon triggers: which fire in response to LOGON events. This event occurs when a user session is being established with SQL Server that is made after the authentication phase finishes, but before the user session is actually established. Logon triggers do not fire if authentication fails
- "Virtual" tables for triggers: INSERTED and DELETED: SQL server provides these two virtual tables for triggers. We could use these tables to get modified row before and after event occurs:

| DML event | INSERTED table holds            | DELETED table holds                  |
| --------- | ------------------------------- | ------------------------------------ |
| INSERT    | rows to be inserted             | empty                                |
| UPDATE    | new rows modified by the update | existing rows modified by the update |
| DELETE    | empty                           | rows to be deleted                   |
- Triggers can be used for logging purpose:
  + We can use DML triggers to track updates to a table when new record has been inserted, or a record has been updated.
  + We can use DDL triggers to capture the modifications to database, such as index changes (creating or updating an index in a table)
- Example:
```sql
-- DML trigger: Create trigger after insert/delete staff (database tuta)
CREATE TRIGGER sto.trg_staff_ins_del
ON sto.staff
AFTER INSERT, DELETE AS
BEGIN
    -- suppress the number of rows affected messages from being returned whenever the trigger is fired.
    SET NOCOUNT ON;

    INSERT INTO sto.staff_log(staff_id, staff_name, staff_gender, staff_email, staff_phone, store_id, updated_at, operation)
    SELECT
        i.id,
        i.staff_name,
        i.staff_gender,
        i.staff_email,
        i.staff_phone,
        i.store_id,
        GETDATE(),
        'INS'
    FROM inserted i  -- using INSERTED table to retrieve modified row
    UNION ALL
    SELECT
        d.id,
        d.staff_name,
        d.staff_gender,
        d.staff_email,
        d.staff_phone,
        d.store_id,
        GETDATE(),
        'DEL'
    FROM deleted d  -- using DELETED table to retrieve modified row
END;

-- DDL trigger: Suppose we want to capture all the modifications made to the database index
-- Create a DDL trigger to track index changes and insert events data into the index_logs table
CREATE TRIGGER trg_index_changes
ON DATABASE FOR CREATE_INDEX, ALTER_INDEX, DROP_INDEX AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO index_logs (
        event_data,
        changed_by
    )
    VALUES (
        EVENTDATA(),
        USER
    );
END;
```

- INSTEAD OF trigger (compare to BEFORE, AFTER trigger above):
  + An INSTEAD OF trigger is a trigger that allows us to skip an INSERT, DELETE, or UPDATE statement to a table/view and execute other statements defined in the trigger instead. The actual insert, delete, or update operation does not occur at all
  + In other words, an INSTEAD OF trigger skips a DML statement and execute other statements
  + Example:
    + An application needs to insert new brands into the ```production.brands``` table. However, the new brands should be stored in another table called ```production.brand_approvals``` for approval before inserting into the ```production.brands``` table.
    + We can create a view called ```production.vw_brands``` for the application to insert new brands. If brands are inserted into the view, an INSTEAD OF trigger will be fired to insert brands into the ```production.brand_approvals``` table

## 12. Cursor
A cursor is an object that enables traversal over the rows of a result set. It allows us to process individual row returned by a query.  
Sometimes we need to work with a row at a time rather than the entire result set at once. In T-SQL, one way of doing this is using a CURSOR.

Example:
```sql
-- Database tuta
-- Here are steps for using a cursor
CREATE PROCEDURE getStaffInfoByStoreId(
    @store_id INT
) AS
BEGIN
    -- Check if exist store
    SELECT id FROM sto.store WHERE id = @store_id;
    IF(@@ROWCOUNT = 0)
    THROW 51000, 'Store doesn''t exist!', 1;

    DECLARE @staff_name NVARCHAR(200),
        @staff_gender NVARCHAR(200), @store_name NVARCHAR(200);

    -- 1. First, declare a cursor. The syntax is: DECLARE cursor_name CURSOR FOR select_statement;
    DECLARE cursor_staff CURSOR
    FOR SELECT staff.staff_name, staff.staff_gender, store.store_name FROM sto.staff staff, sto.store store
        WHERE staff.store_id = store.id
        AND store.id = @store_id

    -- use cursor to traverse each record
    -- 2. Second, open cursor
    OPEN cursor_staff
    WHILE 1=1
        BEGIN
	    -- 3. Third, fetch a row from the cursor into one or more variables
            FETCH NEXT FROM cursor_staff INTO
                @staff_name, @staff_gender, @store_name
            IF @@FETCH_STATUS != 0 BREAK;
            PRINT @staff_name + ' - ' + @staff_gender + ' - ' + @store_name;
        END;
    -- 4. Finally, close cursor and deallocate it
    CLOSE cursor_staff;
    DEALLOCATE cursor_staff;
END;
```

## 13. User-defined functions
User-defined functions are routines that accept parameters, perform an action, such as a complex calculation, and return the result of that action as a value. The return value can either be a single scalar value or a result set.

3 major types of user-defined function types: scalar function, table-valued and multi-statement table-valued function
- Scalar function returns a single data value of the type defined in the RETURNS clause. It can accepts one or more params.
```sql
CREATE FUNCTION sumab(
    @a DEC(10,2),
    @B DEC(10,2)
) RETURNS DEC(20,2) AS
BEGIN
    RETURN @a + @b;
END;
GO

SELECT dbo.sumab(200, 100) AS sum;
GO
```
- Table-Valued function returns a table data type
```sql
-- Database tuta
CREATE FUNCTION funcGetStaffInfoByStoreId(@store_id INT)
RETURNS TABLE AS
RETURN
    SELECT staff.staff_name, staff.staff_gender, store.store_name FROM sto.staff staff, sto.store store
        WHERE staff.store_id = store.id
        AND store.id = @store_id;
GO

SELECT * FROM dbo.funcGetStaffInfoByStoreId(1);
GO
```
- Multi-statement table-valued function (MSTVF) is a table-valued function that returns the result of multiple statements.
```sql
-- Contacts are the data of two tables: staff and customer
-- Database tuta
CREATE FUNCTION funcGetContacts()
RETURNS @contacts TABLE(
    name NVARCHAR(200),
    gender NVARCHAR(20),
    email NVARCHAR(200),
    phone NVARCHAR(50)
) AS
BEGIN
    -- this function returns the result of 2 following statements
    INSERT INTO @contacts
    SELECT st.staff_name, st.staff_gender, st.staff_email, st.staff_phone FROM sto.staff st;
    
    INSERT INTO @contacts
    SELECT cus.cus_name, cus.cus_gender, cus.cus_email, cus.cus_phone FROM sto.customer cus;

    RETURN;
END;
GO

SELECT * FROM funcGetContacts();
GO
```

## 14. INFORMATION_SCHEMA
The INFORMATION_SCHEMA is a database that allows us to retrieve metadata about the objects within a database. Here are some tables/views in it:
INFORMATION_SCHEMA.CHECK_CONSTRAINTS,
INFORMATION_SCHEMA.TABLES,
INFORMATION_SCHEMA.VIEWS,
INFORMATION_SCHEMA.COLUMNS,
INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS: details about foreign keys

## 15. Execution plan
- To be able to execute queries, SQL engine must analyze the statement to determine the most efficient to access the required data. The component handles this analysis is Query Optimizer, and its output is query execution plan (or execution plan)
- An execution plan in SQL Server Management Studio (SSMS) is a graphical representation of the various steps that are involved in fetching results from the database tables. There are 2 types of execution plan:
  + Estimated execution plan: this is just a guess by the query processor about how the specific steps that are to be involved while returning the results. It is generated before the query has been executed
  + Actual Execution Plan: this is generated after the query has been executed. It shows the actual operations and steps involved while executing the query. This may or may not differ from the Estimated Execution Plan

- Đôi khi SQL engine ko dùng index mà Scan cả table (Table Scan operator), bởi vì: the index is not useful, the table contains small number of rows or the query will return most of the table rows

```sql
-- Practice
CREATE TABLE ExPlanOperator_P2(
  ID INT IDENTITY (1,1),
  EmpFirst_Name VARCHAR(50),
  EmpLast_name VARCHAR(50),
  EmpAddress VARCHAR(MAX),
  EmpPhoneNum varchar(50)
)
GO
INSERT INTO ExPlanOperator_P2 VALUES ('AB','BA','CB','123123')
GO 1000
INSERT INTO ExPlanOperator_P2 VALUES ('DA','EB','FC','456456')
GO 1000
INSERT INTO ExPlanOperator_P2 VALUES ('DC','EA','FB','789789')
GO 1000

-- Table scan, because there's no index
SELECT * FROM ExPlanOperator_P2 WHERE EmpFirst_Name = 'BB'

-- Now try to add a non-clustered index
CREATE INDEX IX_ExPlanOperator_P2_EmpFirst_Name ON ExPlanOperator_P2 (EmpFirst_Name)

-- Execute query again:
SELECT * FROM ExPlanOperator_P2 WHERE EmpFirst_Name = 'BB'
```
First, SQL engine will use Non-Clustered index seek: to seek for all employees with EmpFirst_Name = 'BB'.

But SQL Server Engine will not be able to retrieve all requested values
from that non-clustered index (because ```SELECT *```), and there is no clustered index.

So SQL engine will use pointers from that non-clustered index to get the rest of columns,
using RID lookup operator (Row Identifier operator), which is quite expensive.

And then, it use a Nested Loops operator
to join Non-Clustered index seek data with the set of data retrieved from the RID Lookup operator.

Dịch đơn giản như này: do table này chỉ có non-clustered index, nên sẽ gồm 3 operator cho câu query dưới:
1. Non-Clustered index seek: dùng để tìm EmpFirst_Name = 'BB' và các pointers có EmpFirst_Name = 'BB'
2. RID: Lookup các cột còn lại dựa vào pointer lấy ở bước 1
3. Nested loop: join 2 data set ở trên với nhau

```sql
-- Now add a clustered index:
CREATE CLUSTERED INDEX IX_ExPlanOperator_P2_ID on ExPlanOperator_P2 (ID)

-- Now, the step 2 above will become: Key lookup (clustered)
-- Note that RID lookup operator and Key lookup operator are very expensive as
-- they require additional I/O overhead
SELECT * FROM ExPlanOperator_P2 WHERE EmpFirst_Name = 'BB'

-- Now try to use index with included columns:
CREATE INDEX IX_ExPlanOperator_P2_EmpFirst_Name ON ExPlanOperator_P2 (EmpFirst_Name)
INCLUDE (ID,EmpLast_name, EmpAddress, EmpPhoneNum) WITH (DROP_EXISTING = ON)

-- Now, there is no more key lookup operator. ALl 3 steps above now turn into only 1 step:
-- Index seek (non-clustered)
SELECT * FROM ExPlanOperator_P2 WHERE EmpFirst_Name = 'DA'

-- Now try to sort data:
-- There will be another operator appear, it is Sort, which cost 79% of the
-- overall query cost, (the SORT operator is an expensive operator)
-- because the column specified in ORDER BY clause has no index
SELECT * FROM ExPlanOperator_P2
ORDER BY EmpLast_name

-- But if we sort by index column (clustered or non-clustered), there is no Sort operator
SELECT * FROM ExPlanOperator_P2
ORDER BY EmpFirst_Name

------- Other examples, using AdventureWorks2019 database
-- Clustered index scan operator: because ModifiedDate doesn't have an index on it
SELECT * FROM [AdventureWorks2019].[Person].[Address]
where ModifiedDate = '2021-05-25 00:00:00.000';

-- Non-clustered Index Seek: because AddressLine1 has an non-clustered index on it
SELECT AddressLine1 FROM [AdventureWorks2019].[Person].[Address]
where AddressLine1 = '4460 Newport Center Drive';

-- Non-clustered Index Seek + Clusted key lookup
-- Because Non-clustered index key values didn't contain enough data,
-- it only contains the key column values and a pointer to the rest of the columns
SELECT * FROM [AdventureWorks2019].[Person].[Address]
where AddressLine1 = '4460 Newport Center Drive';

-- Clustered-index scan:
-- If there is no useful Non-Clustered index due to out of date statistics, or the query
-- will return all or most of the table rows, the SQL Server Engine will decide that using
-- the Clustered Index Scan operator to scan all the Clustered index rows is faster
-- than using the keys provided by the index.
SELECT * FROM [AdventureWorks2019].[Person].[Address]

-- Clustered-index seek
SELECT * FROM [AdventureWorks2019].[Person].[Address]
where AddressID = 995;
```

Điều kiện WHERE phức tạp hơn chưa chắc query sẽ tốn chi phí hơn
```sql
--------- Xét VD sau về clustered index PK với 2 cột: bảng Sales.SalesOrderDetail,
--------- Database AdventureWorks2019, sau đây là DDL tạo bảng:
CREATE TABLE [Sales].[SalesOrderDetail](
	[SalesOrderID] [int] NOT NULL,
	[SalesOrderDetailID] [int] IDENTITY(1,1) NOT NULL,
	[CarrierTrackingNumber] [nvarchar](25) NULL,
	...,
  CONSTRAINT [PK_SalesOrderDetail_SalesOrderID_SalesOrderDetailID] PRIMARY KEY CLUSTERED (
    [SalesOrderID] ASC,
    [SalesOrderDetailID] ASC
  )...
)

/**
Ta thấy bảng này có 1 clustered index trên 2 cột là SalesOrderID và SalesOrderDetailID,
chú ý thứ tự của chúng: SalesOrderID, do đó việc WHERE trên SalesOrderID sẽ tốt hơn
so với việc WHERE trên cột SalesOrderDetailID
**/
-- Xét 2 query sau:
-- Query 1, using Clustered index seek operator
SELECT SalesOrderID, SalesOrderDetailID
FROM Sales.SalesOrderDetail
WHERE SalesOrderID = 58950

-- Query 2, using Index scan (non-clustered) operator
SELECT SalesOrderID, SalesOrderDetailID
FROM Sales.SalesOrderDetail
WHERE SalesOrderDetailID = 68531

/*
Query 1 chỉ chiếm 1% tổng time chạy, query 2 thì chiếm tận 99%, do query 2 scan index.
Có cách nào tối ưu query 2 ko? Có, đơn giản chỉ cần thêm SalesOrderID vào mệnh đề
WHERE, bởi vì SalesOrderID đứng trước SalesOrderDetailID trong PK
*/
-- Query 3, using Clustered index seek operator, will be faster than query 2
-- Thế mới biết mệnh đề WHERE càng phức tạp ko có nghĩa là khiến performance càng tồi tệ!
SELECT SalesOrderID, SalesOrderDetailID
FROM Sales.SalesOrderDetail
WHERE SalesOrderID = 58950
AND SalesOrderDetailID = 68531

-- Query 4, cũng giống query 3, nhưng đổi thứ tự WHERE
SELECT SalesOrderID, SalesOrderDetailID
FROM Sales.SalesOrderDetail
WHERE SalesOrderDetailID = 68531
AND SalesOrderID = 58950

-- Xem execution plan thì thấy việc đổi này ko ảnh hưởng gì, SQL engine vẫn dùng
-- Clusted index seek operator

-- Query 5: So sánh AND vs OR. Thử chạy query 3 và 5 sau đó xem execution plan.
-- Ta thấy query 5 cost 99% of the overall query cost, và query 5 sử dụng
-- Index scan (non-clustered) operator. Chính việc scan này khiến tốn time
-- => Dùng OR làm giảm performance rất nhiều
SELECT SalesOrderID, SalesOrderDetailID
FROM Sales.SalesOrderDetail
WHERE SalesOrderID = 58950
OR SalesOrderDetailID = 68531
```

Using wildcard at the beginning of LIKE clause is really bad, because SQL engine will not be able to take advantage of Index seek
```sql
-- Giả sử bảng [Person].[Address] có index trên cột Address
-- Index seek (non-clustered) + Key lookup (clustered)
SELECT * FROM [AdventureWorks2019].[Person].[Address]
where AddressLine1 = '4460 Newport Center Drive';

-- Index seek (non-clustered) + Key lookup (clustered)
SELECT * FROM [AdventureWorks2019].[Person].[Address]
where AddressLine1 LIKE '4460 Newport Center%';

-- Index seek (non-clustered) + Key lookup (clustered)
SELECT * FROM [AdventureWorks2019].[Person].[Address]
where AddressLine1 LIKE '4460 %Newport Center%';

-- Index scan (non-clustered) + Key lookup (clustered)
SELECT * FROM [AdventureWorks2019].[Person].[Address]
where AddressLine1 LIKE '%4460 Newport Center%';

/**
Ta nhận thấy nếu dùng toán tử = hoặc dùng LIKE nhưng ko có wildcard ở đầu thì
sẽ tận dụng được index seek, nhưng nếu dùng LIKE với wildcard ở đầu thì ko tận dụng
được index, SQL engine phải scan cả index tree
4 câu query trên, time thực hiện lần lượt là 3%, 4%, 4%, 89%
**/
```

Please don't use SELECT TOP, SQL engine will use Index scan, even if we only SELECT TOP 1:
```sql
Use [BikeStores];
SELECT TOP 1 *
FROM [BikeStores].[production].[products]
```

Hash match vs Merge join
```sql
-- When we join two tables, SQL engine will use Hash match (inner join) operator
SELECT p.product_id, p.product_name, b.brand_name
FROM production.products p
INNER JOIN production.brands b ON p.brand_id = b.brand_id

-- When we join two tables and the two JOIN data sets are sorted according to the join predicate,
-- SQL engine will use Merge join (inner join) operator
SELECT p.product_id, p.product_name, b.brand_name
FROM production.products p
INNER JOIN production.brands b ON p.brand_id = b.brand_id
ORDER BY p.brand_id
```

Ref:
- https://www.sqlshack.com/sql-server-execution-plan-operators-part-2/
- https://www.sqlshack.com/execution-plans-in-sql-server/

## 16. Sargable query
- Sargable is a contraction of Search Argument Able. In relation database, a condition/predicate in a query is said to be sargable if the DBMS engine can take advantage of an index to speed up the execution time
- A query failing to be sargable is known as non-sargable

```sql
-- Example of sargable query: this query uses index seek (non-clustered) + key lookup
SELECT * FROM [AdventureWorks2019].[Person].[Address]
where AddressLine1 LIKE 'N%';

-- Example of non-sargable query: this query uses index scan (clustered)
SELECT * FROM [AdventureWorks2019].[Person].[Address]
where AddressLine1 LIKE '%N';

---------- Another example
-- non-sargable query:
SELECT FirstName FROM Person where LEFT(FirstName, 1) = 'K'

/**
If we see execution plan, we'll know that SQL engine are using
clustered-index scan operator, which is very expensive
(The SQL Server query optimizer cannot find the result of the LEFT function values in the index pages.
For this reason, the query optimizer chooses a cluster index scan and it needs to read the whole table.)
These functions create the same execution plans in the same conditions:
SUBSTRING, LEFT, LTRIM, RTRIM, User defined functions
**/
-- Change previous query to a sargable query:
SELECT FirstName FROM Person where FirstName LIKE 'K%'

-- SQL engine now will use Index seek (clustered) operator, which is much faster than scan operator

-- Another solution: create a calculated column and create an index on that column:
ALTER TABLE Person ADD FirstName_Left AS LEFT(FirstName, 1)
CREATE NONCLUSTERED INDEX idx_LeftFirstName ON Person (
	[FirstName_Left] ASC
) INCLUDE ([FirstName])

-- Now this query will be sargable:
SELECT FirstName FROM Person where FirstName_Left = 'K'

---------- Another example
-- non-sargable query, operator used: index scan
SELECT ModifiedDate FROM Person where YEAR(ModifiedDate)=2009

-- sargable query, operator used: index seek:
SELECT ModifiedDate FROM Person where ModifiedDate BETWEEN '20090101' AND '20091231'
```

## 17. CTE
CTE stands for Common Table Expression. A CTE allows us to define a temporary table in the execution scope of a statement, such as SELECT, INSERT, UPDATE...

```sql
-- Example: here is the query to calculate total orders of each staff in 2018:
SELECT
    staff_id, 
    COUNT(*) order_count  
FROM sales.orders
WHERE YEAR(order_date) = 2018
GROUP BY staff_id

-- We want to calculate average orders by staff, we could use subquery like this:
SELECT AVG(order_count) FROM (
	SELECT
		staff_id, 
		COUNT(*) order_count  
	FROM sales.orders
	WHERE YEAR(order_date) = 2018
	GROUP BY staff_id
) AS staff_orders

-- Or we could use CTE like this:
WITH staff_orders(staff_id, order_count) AS (
	SELECT
		staff_id, 
		COUNT(*) order_count  
	FROM sales.orders
	WHERE YEAR(order_date) = 2018
	GROUP BY staff_id
)
SELECT AVG(order_count) FROM staff_orders
```

## 18. Normalization
- Database normalization is the process of restructuring a relational database in accordance with normal forms in order to reduce data redundancy and improve data integrity (tái cấu trúc CSDL quan hệ phù hợp với các dạng thông thường để giảm dư thừa dữ liệu và cải thiện tính toàn vẹn của dữ liệu)
- Normalization divides the larger table into the smaller tables and links them using relationship
- Types of Normal Forms:

### 18.1. First Normal Form (1NF): the 1NF relates to atomicity.
A table will be in 1NF if it contains only atomic value. In simple term, a single cell cannot hold multiple values. (Atomicity means values in the table should not be further divided)

Ex: the following table violates 1NF because of multi-valued attribute EMP_PHONE
| EMP_ID  | EMP_NAME  | EMP_PHONE             | EMP_STATE  |
| ------- | --------- | --------------------- | ---------- |
| 14      | John      | 7272826385,9064738238 | UP         |
| 20      | Harry     | 8574783832            | Bihar      |
| 12      | Sam       | 7390372389,8589830302 | Punjab     |

The decomposition of the EMPLOYEE table into 1NF has been shown below
| EMP_ID  | EMP_NAME  | EMP_PHONE  | EMP_STATE  |
| ------- | --------- | ---------- | ---------- |
| 14      | John      | 7272826385 | UP         |
| 14      | John      | 9064738238 | UP         |
| 20      | Harry     | 8574783832 | Bihar      |
| 12      | Sam       | 7390372389 | Punjab     |
| 12      | Sam       | 8589830302 | Punjab     |

Using the First Normal Form, data redundancy increases (few values are getting repeated), but values for the EMP_PHONE column are now atomic for each record/row.

### 18.2. Second Normal Form (2NF): the 2NF relates to partial dependency (partial dependency means subset of composite primary key determines a non-key column)
- A table will be in 2NF if it is in 1NF, and all non-key columns are fully functional dependent on the primary key. The partial dependencies are removed and placed in a separate table
- Second Normal Form (2 NF) is a problem when we're using a composite primary key (a primary key made of two or more columns)

Ex: The last table employee above, composite PK is (EMP_ID, EMP_PHONE). We could see that column EMP_NAME ONLY depends on EMP_ID and it partially depends on EMP_PHONE column. So we could divide this table into 2 smaller tables below:

Table Employee:
| EMP_ID  | EMP_NAME  | EMP_STATE  |
| ------- | --------- | ---------- |
| 14      | John      | UP         |
| 20      | Harry     | Bihar      |
| 12      | Sam       | Punjab     |

Table phone:
| EMP_ID  | EMP_PHONE  |
| ------- | ---------- |
| 14      | 7272826385 |
| 14      | 9064738238 |
| 20      | 8574783832 |
| 12      | 7390372389 |
| 12      | 8589830302 |

### 18.3. Third Normal Form (3NF): the 3NF states that we should eliminate fields in a table that do not depend on primary key
- A table will be in 3NF if:
  + It is already in 2NF
  + Non-Primary key columns do not depend on the other non-Primary key columns
  + There is no transitive functional dependency (ko có phụ thuộc hàm bắc cầu)
- Ex:

Employee_detail table:
| EMP_ID  | EMP_NAME  | EMP_ZIP  | EMP_STATE  | EMP_CITY  |
| ------- | --------- | -------- | ---------- | --------- |
| 222     | Harry     | 201010   | UP         | Noida     |
| 333     | Stephan   | 02228    | US         | Boston    |
| 444     | Lan       | 60007    | US         | Chicago   |
| 555     | Katharine | 06389    | UK         | Norwich   |
| 666     | John      | 462007   | MP         | Bhopal    |

In the above table, PK is EMP_ID, but EMP_STATE, EMP_CITY depend on EMP_ZIP and EMP_ZIP depends on EMP_ID => EMP_STATE, EMP_CITY are transitively dependent on PK EMP_ID. We should divide this table into 2 smaller tables below:

Employee table:
| EMP_ID  | EMP_NAME  | EMP_ZIP        |
| ------- | --------- | -------------- |
| 222     | Harry     | 201010         |
| 333     | Stephan   | 02228          |
| 444     | Lan       | 60007          |
| 555     | Katharine | 06389          |
| 666     | John      | 462007         |

Employee_zip table:
| EMP_ZIP  | EMP_STATE  | EMP_CITY  |
| -------- | ---------- | --------- |
| 201010   | UP         | Noida     |
| 02228    | US         | Boston    |
| 60007    | US         | Chicago   |
| 06389    | UK         | Norwich   |
| 462007   | MP         | Bhopal    |

### 18.4. Boyce Codd normal form (BCNF)
BCNF is the advance version of 3NF, a table is in BCNF if it is in 3NF and every functional dependency X → Y, X is the primary key of the table.

Example, let see the table below, assume that each teacher only teaches one subject, but one subject may have two different professors:
| student_id  | subject | teacher       |
| ----------- | ------- | ------------- |
| 101         | Java    | Nguyen Bka    |
| 101         | C++     | Toan Tvt      |
| 102         | Java    | Tuzaku        |
| 103         | C#      | Huy Ga        |
| 104         | Java    | Tuzaku        |
| 105         | C++     | Toan Tvt      |

What do you think should be the Primary Key? Well, in the table above student_id, subject together form the primary key, because using student_id and subject, we can find all the columns of the table.

- This table satisfies the 1st Normal form because all the values are atomic
- This table also satisfies the 2nd Normal Form as their is no Partial Dependency (student_id cannot determine teacher, subject cannot determine teacher)
- And, there is no Transitive Dependency, hence the table also satisfies the 3rd Normal Form
- But this table is not in Boyce-Codd Normal Form, because there is one more dependency, teacher → subject

We can divide into two tables below:

Student_teacher table
| student_id  | teacher_id |
| ----------- | ---------- |
| 101         | 1          |
| 101         | 2          |
| 102         | 3          |
| 103         | 4          |
| 104         | 3          |
| 105         | 2          |

Teacher table
| teacher_id | teacher_name | subject |
| ---------- | ------------ | ------- |
| 1          | Nguyen Bka   | Java    |
| 2          | Toan Tvt     | C++     |
| 3          | Tuzaku       | Java    |
| 4          | Huy Ga       | C#      |

## 19. ACID
ACID is an acronym for Atomicity (tính nguyên tử), Consistency (tính nhất quán), Isolation (tính cô lập), Durability (tính bền vững).  
ACID is a set of properties of database transactions intended to guarantee data validity (đảm bảo tính hợp lệ của dữ liệu). In the context of databases, a sequence of database operations that satisfies the ACID properties is called a *transaction*

![acid](https://user-images.githubusercontent.com/26838239/121666269-433e5200-cad3-11eb-84ae-7b14a4277e76.png)

- **Atomicity** guarantees that each transaction is treated as a single "unit", which either succeeds completely, or fails completely: if any of the statements in a transaction fails to complete, the entire transaction fails and the database is left unchanged (transaction will rollback).  
Example: a transaction inserts 10 records, but while inserting the third record, an error occurs, the transaction will rollback and there's no record has been inserted. If INSERT statement has a trigger, and there's an error on that trigger, the transaction will also rollback
- **Consistency** ensures that the database must remain in a consistent state after any transaction. This property, either creates an entire new situation or rollback all the processes to the original situation, but never leaves database in the state which is middle of the two situations.
- Transactions are often executed concurrently (e.g., multiple transactions reading and writing to a table at the same time). **Isolation** ensures that any transaction is in process must remain isolated from any other transactions. In other words, two or more transactions are never mixed up with each other
- **Durability** guarantees that committed data is saved by the system, even in the case of a system failure (e.g., power outage or crash - mất điện hoặc sự cố), or system restart, the data is available in its correct state

## 20. Performance tuning: vertical partitioning
Vertical partitioning means splitting a large table into smaller tables that contain fewer columns. For example we can divide a large table into two tables: a table contains a group of frequently used columns, and a table contains the remaining columns (một bảng chứa một nhóm các cột được sử dụng thường xuyên và một bảng chứa các cột còn lại)

Vậy lý do nào dẫn đến cải thiện về hiệu năng? Điều này liên quan đến cách tổ chức dữ liệu của bảng bên trong SQL Server. SQL Server chia mỗi bảng thành các trang (page) có kích thước đều nhau 8KB. Các bản ghi được lưu nối tiếp nhau vào từng trang, đến khi đầy trang thì lưu tiếp sang trang mới. Tùy theo kích thước của bản ghi (bằng kích thước của các cột cộng lại) mà có bao nhiêu bản ghi được xếp vừa vào một trang. Nếu kích thước nhỏ sẽ có nhiều bản ghi được chứa trong một trang, ngược lại nếu kích thước lớn thì mỗi trang sẽ chứa được ít bản ghi. Thậm chí nếu kích thước này vượt quá 8KB thì vài trang mới chứa hết một bản ghi (SQL Server 2000 không cho phép điều này nên kích thước bản ghi tối đa được phép tạo trong SQL Server 2000 chỉ là 8KB).

Example
```sql
-- Database tuta
CREATE TABLE TableA(ID INT, txt1 CHAR(10), txt2 CHAR(8000))
CREATE TABLE TableB1(ID INT, txt1 CHAR(10))
CREATE TABLE TableB2(ID INT, txt2 CHAR(8000))
GO

DECLARE @i INT
SET @i=1
WHILE @i<=100
BEGIN
INSERT TableA (ID, txt1, txt2)
SELECT @i, REPLICATE('a',10), REPLICATE('a',8000)

INSERT TableB1 (ID, txt1)
SELECT @i, REPLICATE('a',10)

INSERT TableB2 (ID, txt2)
SELECT @i, REPLICATE('a',8000)
SET @i=@i+1
END
GO

--ghi dữ liệu ra đĩa và xóa cache
CHECKPOINT

-- hiện thống kê về vào ra đĩa
SET STATISTICS IO ON

-- xóa cache để đảm bảo công bằng khi so sánh
DBCC DROPCLEANBUFFERS

-- query1
SELECT ID, txt1
FROM TableA

-- xóa lại cache
DBCC DROPCLEANBUFFERS

-- query2
SELECT ID, txt1
FROM TableB1
```

Although result of query1 and query2 are the same, but the cost of reading from TableB1 is cheaper than from TableA (4% vs 96% of overall query cost)

![vertical-partitioning-example](https://user-images.githubusercontent.com/26838239/125435898-049a4f6b-e644-4495-afaf-cc29b648700f.PNG)

Open message tab in SSMS, we can see this:
```
Table 'TableA'. Scan count 1, logical reads 100, physical reads 0, page server reads 0, read-ahead reads 100, page server read-ahead reads 0, lob logical reads 0, lob physical reads 0, lob page server reads 0, lob read-ahead reads 0, lob page server read-ahead reads 0.

Table 'TableB1'. Scan count 1, logical reads 1, physical reads 1, page server reads 0, read-ahead reads 0, page server read-ahead reads 0, lob logical reads 0, lob physical reads 0, lob page server reads 0, lob read-ahead reads 0, lob page server read-ahead reads 0.
```

On the example above:
- Size of each record in TableA is about 8KB (4byte INT + 10byte char + 8000byte char), so each record will be store in one page. 100 records in TableA will be stored in 100 pages
- Size of each record in TableB1 is 14byte, so 100 records will be stored in 1 page. That's why reading from TableB1 is much faster than from TableA

Kỹ thuật phân đoạn này cũng kéo theo một vài rắc rối khi viết code:
- Đối với lệnh SELECT, bạn phải nhớ các cột nào nằm ở bảng nào để viết câu lệnh cho đúng, vì các cột giờ không nằm chung trong một bảng nữa
- Khi có thay đổi về thiết kế, chẳng hạn cần di chuyển cột từ bảng này sang bảng kia, bạn phải quay lại sửa lại câu lệnh cũ
- Đối với các lệnh DELETE/INSERT/UPDATE, bạn luôn nhớ cần thực hiện trên cả hai bảng. Bạn có thể thực hiện câu lệnh qua view, và ở bên dưới view tạo một trigger loại ```INSTEAD OF``` trong đó thực hiện thao tác trên cả hai bảng

Ref: http://www.sqlviet.com/blog/phan-doan-bang-theo-chieu-doc

Another example:
```sql
-- Database tuta
-- EmployeeReports has 4 columns, and size of ReportDescription column is the biggest one
CREATE TABLE EmployeeReports(
  ReportID int IDENTITY (1,1) NOT NULL,
  ReportName varchar (100),
  ReportNumber varchar (20),
  ReportDescription varchar (max)
  CONSTRAINT EReport_PK PRIMARY KEY CLUSTERED (ReportID)
)
 
DECLARE @i int
SET @i = 1
 
BEGIN TRAN
WHILE @i < 100000 
BEGIN
INSERT INTO EmployeeReports(
  ReportName,
  ReportNumber,
  ReportDescription
)
VALUES (
  'ReportName',
  CONVERT (varchar (20), @i),
  REPLICATE ('Report', 1000)
)
SET @i=@i+1
END
COMMIT TRAN
GO

-- Try this query to see CPU time
DBCC DROPCLEANBUFFERS  -- remove cache
SET STATISTICS IO ON
SET STATISTICS TIME ON

SELECT er.ReportID, er.ReportName, er.ReportNumber
FROM dbo.EmployeeReports er
WHERE er.ReportNumber LIKE '%33%'

SET STATISTICS IO OFF
SET STATISTICS TIME OFF
```

Open message tab, we will see:
```
SQL Server Execution Times:
  CPU time = 156 ms,  elapsed time = 86 ms.
```

Now split this table into two tables: a table contains ReportID, ReportName, ReportNumber columns and a table contains only ReportDescription column
```sql
CREATE TABLE ReportsDesc(
	ReportID int FOREIGN KEY REFERENCES EmployeeReports (ReportID),
	ReportDescription varchar(max)
	CONSTRAINT PK_ReportDesc PRIMARY KEY CLUSTERED (ReportID)
)

CREATE TABLE ReportsData(
	ReportID int NOT NULL,
	ReportName varchar (100),
	ReportNumber varchar (20),
	CONSTRAINT DReport_PK PRIMARY KEY CLUSTERED (ReportID)
)

INSERT INTO dbo.ReportsData(
    ReportID,
    ReportName,
    ReportNumber
)
SELECT er.ReportID, 
er.ReportName, 
er.ReportNumber 
FROM dbo.EmployeeReports er

-- Try this query to see CPU time
DBCC DROPCLEANBUFFERS  -- remove cache
SET STATISTICS IO ON
SET STATISTICS TIME ON

SELECT er.ReportID, er.ReportName, er.ReportNumber
FROM ReportsData er
WHERE er.ReportNumber LIKE '%33%'

SET STATISTICS IO OFF
SET STATISTICS TIME OFF
```

Open message tab, we will see it takes less time than previous query:
```
SQL Server Execution Times:
  CPU time = 31 ms,  elapsed time = 69 ms.
```

Want to see query cost: open execution plan tab and we can see: 99% vs 1%:

![Capture](https://user-images.githubusercontent.com/26838239/125437208-59131b95-79f3-42e3-b3d5-67ec1c36204a.PNG)

## 21. Query optimization techniques in SQL Server
Ref of this series: https://www.sqlshack.com/query-optimization-techniques-in-sql-server-the-basics/  
Thực sự thấy cái series này nó quá dài và lan man, khó hiểu, nhiều từ vựng, nên ở dưới chỉ tóm tắt 1 số ý dễ hiểu

### The basics
#### 1. Defining Optimization
We usually cannot spend the resources needed to make a script run as fast as possible, nor should we want to.  
For the sake of simplicity, we will define **"optimal" as the point at which a query performs acceptably and will continue to do so for a reasonable amount of time in the future**

Over-optimization sounds good, but in the context of resource management is generally wasteful. A giant (but unnecessary) covering index will cost us computing resources whenever we write to a table for the rest of eternity (a long time)

#### 2. What Does the Query Do?
Step #1 is to step back and understand the query. Some helpful questions that can aid in optimization:
- **How large is the result set?** Should we brace ourselves (gồng mình lên) for a million rows returned, or just a few?
- **Are there any parameters that have limited values?** Will a given parameter always have the same value, or are there other limitations on values that can simplify our work by eliminating avenues of research.
- **How often is the query executed?** Something that occurs once a day will be treated very differently than one that is run every second.
- **Are there any invalid or unusual input values that are indicative of an application problem?** Is one input set to NULL, but never should be NULL? Are any other inputs set to values that make no sense, are contradictory, or otherwise go against the use-case of the query?
- **Are there any obvious logical, syntactical, or optimization problems staring us in the face?** Do we see any immediate performance bombs that will always perform poorly, regardless of parameter values or other variables?
- **What is acceptable query performance?** How fast must the query be for its consumers to be happy? If server performance is poor, how much do we need to decrease resource consumption for it to be acceptable? Lastly, what is the current performance of the query? This will provide us with a baseline so we know how much improvement is needed.

#### 3. Tools
- **Execution Plans**: it provides a graphical representation of how the query optimizer chose to execute a query

- **STATISTICS IO**: This allows us to see how many logical and physical reads are made when a query is executed. We can turn it on by run this query:
```sql
SET STATISTICS IO ON;
```

After that, we can see additional data in Messages pane:
```
(1000 rows affected)
Table 'Customer'. Scan count 1, logical reads 9, physical reads 0, page server reads 0, read-ahead reads 114,...
```

Logical reads tell us how many reads were made from the buffer cache. This is the number that we will refer to whenever we talk about how many reads a query is responsible for, or how much IO it is causing.

Physical reads tell us how much data was read from a storage device as it was not yet present in memory. This can be a useful indication of buffer cache/memory capacity problems if data is very frequently being read from storage devices, rather than memory.

In general, IO will be the primary cause of latency and bottlenecks when analyzing slow queries. The unit of measurement of STATISTICS IO = 1 read = a single 8kb page = 8192 bytes.

- **Query Duration**: we will measure duration manually using the timer found in the lower-right hand corner of SSMS. (There are other ways to accurately measure query duration, such as setting on STATISTICS TIME, but we'll focus on queries that are slow enough that such a level of accuracy will not be necessary. We can easily observe when a 30 second query is improved to run in sub-second time.)

- **Our Eyes**: Many performance problems are the result of common query patterns that we will become familiar with below. (As we optimize more and more queries, quickly identifying these indicators becomes more second-nature and we'll get the pleasure of being able to fix a problem quickly, without the need for very time-consuming research.)

#### 4. What Does the Query Optimizer Do?
Every query follows the same basic process from T-SQL to completing execution on a SQL Server:
- **Parsing** is the process by which query syntax is checked (ex: wrong key words, named a column using a reserved word, forgot semicolon...)
- **Binding** checks all objects referenced in your TQL against the system catalogs and any temporary objects defined within your code to determine if they are both valid and referenced correctly. The result of this step is a query tree that is composed of a basic list of the processes needed to execute the query
- **Optimization**: the optimizer operates similarly to a chess (or any gaming) computer. It needs to consider an immense number of possible moves as quickly as possible, remove the poor choices, and finish with the best possible move. In the world of SQL Server, chess moves mean execution plans: query optimizer need to choose an execution plan
- **Execution** is the final step. SQL Server takes the execution plan that was identified in the optimization step and follows those instructions in order to execute the query

#### 5. Common Themes in Query Optimization
- Index Scans: Data may be accessed from an index via either a scan or a seek. If a table contains a million rows, then a scan will need to traverse all million rows to service the query. A seek of the same table can traverse the index's binary tree quickly to return only the data needed, without the need to inspect the entire table.

- Functions Wrapped Around Joins and WHERE Clauses: Consider the following query:
```sql
SELECT...
FROM Person
WHERE LEFT(Person.LastName, 3) = 'For';
```
The entire index was scanned to return our data, because we use ```LEFT``` function. We can change it by:
```sql
WHERE Person.LastName LIKE 'For%';
```
This will take advantage of index seek

- Implicit Conversions: Consider the following SELECT query, which is filtered against an indexed column:
```sql
SELECT
	EMP.BusinessEntityID,
	EMP.LoginID,
	EMP.JobTitle
FROM HumanResources.Employee EMP
WHERE EMP.NationalIDNumber = 658797903;
```
But we still got a table scan for our efforts! Because the data type of NationalIDNumber column is NVARCHAR, the value we are comparing it to is a numeric. The solution to this problem is very simple:
```sql
WHERE EMP.NationalIDNumber = '658797903';
```

### Tips and tricks
#### 1. OR in the Join Predicate/WHERE Clause Across Multiple Columns
SQL Server can efficiently take advantage of indexes via the WHERE clause and ```AND``` operator. But ```OR``` is a different story, each component of the OR must be evaluated independently. When this expensive operation is completed, the results can then be concatenated and returned normally. Example:
```sql
-- Database AdventureWorks2019
SELECT DISTINCT
	PRODUCT.ProductID,
	PRODUCT.Name
FROM Production.Product PRODUCT
INNER JOIN Sales.SalesOrderDetail DETAIL
ON PRODUCT.ProductID = DETAIL.ProductID
OR PRODUCT.rowguid = DETAIL.rowguid;
```

Open Messages Pane and Execution Plan, we will see SQL engine scanned both tables!
```
Table 'Product'. Scan count 7, logical reads 40, physical reads 0,...
Table 'SalesOrderDetail'. Scan count 6, logical reads 7488, physical reads 0,...
Table 'Worktable'. Scan count 6, logical reads 1734026, physical reads 0,...
Table 'Worktable'. Scan count 0, logical reads 0, physical reads 0,...
```

The best way to deal with an OR is to *eliminate* it (if possible) or break it into smaller queries, example:
```sql
SELECT
	PRODUCT.ProductID,
	PRODUCT.Name
FROM Production.Product PRODUCT
INNER JOIN Sales.SalesOrderDetail DETAIL
ON PRODUCT.ProductID = DETAIL.ProductID
UNION
SELECT
	PRODUCT.ProductID,
	PRODUCT.Name
FROM Production.Product PRODUCT
INNER JOIN Sales.SalesOrderDetail DETAIL
ON PRODUCT.rowguid = DETAIL.rowguid
```

Here is the new result in Messages pane
```
Table 'Worktable'. Scan count 0, logical reads 0, physical reads 0,...
Table 'Product'. Scan count 2, logical reads 30, physical reads 0,...
Table 'SalesOrderDetail'. Scan count 2, logical reads 737, physical reads 4,...
```

And Execution plan pane:

![convert-or-to-union](https://user-images.githubusercontent.com/26838239/125437611-02b1fab5-fe55-42bf-a4e7-b155173dc8b0.png)


We can see logical reads now is decreased immensely

#### 2. Wildcard String Searches
SQL Server is not good at fuzzy string searching:
```sql
SELECT
	Person.BusinessEntityID,
	Person.FirstName,
	Person.LastName,
	Person.MiddleName
FROM Person.Person
WHERE Person.LastName LIKE '%For%';
```

In execution plan: SQL engine used Index scan operator
In messages pane:
```
Table 'Person'. Scan count 1, logical reads 107, physical reads 0,...
```

Solution:
- **Remove wildcard** if we can, or at least change from "%For%" to "For%"
- Apply other filters to reduce data size:  If we can filter by date, time, status, or some other commonly used type of criteria, we can perhaps reduce the data we need to scan down to a small enough amount so that our query perform acceptably
- Implement **full-text index**. If a table has a billion rows and users want to frequently search an NVARCHAR(MAX) column for occurrences of strings in any position, we could think of this solution
- Implement a **query hash** or **n-gram solution**. Pros: provide very fast search capabilities. Cons: maintenance is hard: we need to update the n-gram table every time a row is inserted, deleted, or the string data in it is updated; also, the number of n-grams per row will increase rapidly as the size of the column increases  
=> This is an excellent approach for **shorter strings**, such as **names, zip codes, or phone numbers**. It is a very expensive solution for longer strings, such as email text, descriptions

## 22. SQL Server Index Architecture and Design Guide
Ref: https://docs.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide

### 1. General Index Design Guidelines
#### Database Considerations
- Databases or tables with **low update** requirements, but **large volumes of data** can benefit from many nonclustered indexes to improve query performance: Large numbers of indexes on a table will reduce the performance of INSERT, UPDATE, DELETE, and MERGE statements (because all indexes must be adjusted appropriately as data in the table changes)
- **Indexing small tables** may *not be optimal* because it can take the query optimizer longer to traverse the index searching for data than to perform a simple table scan
- Use the *Database Engine Tuning Advisor* to analyze your database and make index recommendations

#### Query Considerations
- Create **nonclustered indexes** on the columns that are frequently used in predicates and join conditions in queries. These are your **SARGable columns**
- **Covering indexes** can improve query performance because all the data needed to meet the requirements of the query exists within the index itself
- Write queries that insert or modify as *many rows* as possible in a **single statement**, instead of using multiple queries to update the same rows. By using only one statement, optimized index maintenance could be exploited

#### Column Considerations
- Keep the **length** of the index key **short** for clustered indexes
- Indexes should be **narrow** (with **as few columns as possible**)
- Clustered indexes should be created on **unique** or **nonnull** columns
- Columns that are of the **ntext, text, image, varchar(max), nvarchar(max)**, and **varbinary(max)** data types cannot be specified as index key columns
- An xml data type can only be a key column in an XML index
- Examine column **uniqueness**: a unique index will be better than a nonunique index
- Examine **data distribution**: indexes will be better on columns that are **unique** or contain lots of distinct values
  + Ex1: physical telephone directory sorted alphabetically on last name will not expedite locating a person if all people in the city are named Smith or Jones: 1 cuốn danh bạ đt sắp xếp theo họ sẽ KHÔNG dễ dàng tìm vị trí của 1 người nếu tất cả mọi người đều có họ là Smith hoặc John)
  + Ex2: if there are very few distinct values, such as only 1 and 0, most queries will not use the index because a table scan is generally more efficient
- Consider using **filtered indexes** on columns that have well-defined subsets, ex: sparse columns, columns with mostly NULL values, columns with categories of values, and columns with distinct ranges of values
- Consider the order of the columns if the index will contain multiple columns. The column that is used in the WHERE clause or a join, should be placed first

#### Index Sort Order
- When defining indexes, we should consider the order of data for the index key column (ascending (default) or descending)
- If a query contains ```ORDER BY``` clause that specifies the same direction with the order of data in index, then SQL engine can remove the SORT operator, ex:
```sql
/*
Db AdventureWorks2019: the PurchaseOrderDetail table already has clustered index on two column below:
ALTER TABLE [Purchasing].[PurchaseOrderDetail] ADD CONSTRAINT
[PK_PurchaseOrderDetail_PurchaseOrderID_PurchaseOrderDetailID] PRIMARY KEY CLUSTERED 
(
    [PurchaseOrderID] ASC,
    [PurchaseOrderDetailID] ASC
)
*/
-- Query 1
SELECT * FROM [AdventureWorks2019].[Purchasing].[PurchaseOrderDetail]
ORDER BY PurchaseOrderID, PurchaseOrderDetailID;

-- Query 2
SELECT * FROM [AdventureWorks2019].[Purchasing].[PurchaseOrderDetail]
ORDER BY PurchaseOrderID DESC, PurchaseOrderDetailID

/*
Open execution plan, we can see the query cost of each query:
Query 1: 11%
Query 2: 89%
It's because the query 2 has additional SORT operator
*/
```

![Capture](https://user-images.githubusercontent.com/26838239/125438260-a150b544-ca40-49b9-a491-a7a0dd389a4d.PNG)

```sql
-- Another example, has SORT operator:
SELECT RejectedQty, ((RejectedQty/OrderQty)*100) AS RejectionRate,
    ProductID, DueDate
FROM Purchasing.PurchaseOrderDetail  
ORDER BY RejectedQty DESC, ProductID ASC;

-- If we are most interested in finding products sent by these vendors with a high rejection rate,
-- we could create the following index to remove SORT operator in that query:
CREATE NONCLUSTERED INDEX IX_PurchaseOrderDetail_RejectedQty
ON Purchasing.PurchaseOrderDetail
    (RejectedQty DESC, ProductID ASC, DueDate, OrderQty);
```

### 2. Clustered Index Design Guidelines
#### Query Considerations
- Consider using a clustered index for queries that do the following:
  + Return a range of values by using operators such as ```BETWEEN```, >, >=, <, and <=
  + Return **large result sets**
  + Use **JOIN clauses**; typically these are foreign key columns
  + Use **ORDER BY** or **GROUP BY** clauses: an index on the columns specified in the ORDER BY or GROUP BY clause may remove the need for SQL engine to use *SORT operator*

#### Column Considerations
- We can define clustered index on columns that have one or more of the following attributes (khá giống với general guide ở trên):
  + Indexes should be **narrow**: define the clustered index key with **as few columns as possible**
  + Columns that are **unique** or contain lots of distinct values
  + Columns defined as IDENTITY
  + Columns used frequently to sort the data retrieved from a table

- Clustered indexes are not a good choice for the following attributes:
  + Columns that undergo frequent changes (Các cột chịu sự thay đổi thường xuyên)
  + Wide keys (Wide keys are a composite of several columns or several large-size columns)
