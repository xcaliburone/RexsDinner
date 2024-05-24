// import React from 'react';

function Dashboard() {
    return (
        <>
            <div className="orders">

                <div className="sideBar">
                    {/*
                        mereka harusnya merupakan tombol dimana employee hanya bisa menekan salah satu dari semu tombol didalam sini,
                        ketika tombol tersebut active maka berikan warna hijau
                    */}
                    <div className="sideBarTop">
                        <div className="sideButton">
                            Create Order
                        </div>
                        <div className="sideButton">
                            Order Queue
                        </div>
                        <div className="sideButton">
                            Order History
                        </div>
                    </div>

                    <div className="sideBarBottom">
                        <div className="sideButton">
                            Menu
                        </div>
                        <div className="sideButton">
                            Ingredients
                        </div>
                    </div>

                </div>

                <div className="dashboard">

                    <div className="orderTemplate orderCreate">
                        {/* 
                            form untuk membuat pesanan, berisi informasi mengenai
                            1. employee yang membuat formulir tersebut (diambil dari info id user yang login)
                            2. employee memasukkan nama customers dan jika ada maka ambil id dan nama customers tersebut, jika tidak ada maka
                                masukkan kedalam tabel beserta diberikan id nya
                            3. catat waktu order berdasarkan waktu saat ini
                            4. employee memilih status apakah dine in atau take away
                            6. employee memasukkan menu apa saja yang dipesan oleh customers dan jumlahnya kemudian dihitung berdasarkan quantity
                                (pada tabel order_details menghitung quantity dikali dengan price menu tersebut pada tabel menus) kemudian
                                (pada tabel orders menjumlahkan semua price yang terkait pada orders tersebut)
                            7. dan pada tabel order_details membutuhkan id, order_id, menu_id, quantity dan price
                        */}
                    </div>

                    <div className="orderTemplate orderQueue">
                        {/* 
                            disini menyimpan dan menampilkan semua informasi dari order per order kemudian empolyee menekan tombol complete
                            untuk memindahkan order tersebut kedalam order history
                        */}
                    </div>

                    <div className="orderTemplate orderHistory">
                        {/* tempat semua order yang sudah diselesaikan */}
                    </div>

                    <div className="orderTemplate menus">
                        {/*
                            disini menyimpan semua informasi mengenai id, name, dan price dari tabel menu serta menampilkan ingredients yang
                            dibutuhkan oleh menu tersebut pada tabel menu_ingredients dengan kolom menu_id, ingredient_id, quantity yang
                            mengacu pada tabel ingredients dengan kolom id, name, stocks
                        */}
                    </div>

                    <div className="orderTemplate ingredients">
                        {/* 
                            disini menampilan tabel ingredients dengan kolom id, name, dan stock. kita bisa menambahkan stock secara manual
                            (hanya bisa manual) dan bisa mengurangi stock secara manual (bisa otomatis dengan employee menambahkan tapi saya
                            bingung karena harus ada id customers didalamnya. Hal ini berhubungan pada tabel stock_transactoins dengan
                            kolom id, employee_id, customers_id, quantity, transaction_time, type)
                        */}
                    </div>

                </div>


            </div>
        </>
    );
}

export default Dashboard;