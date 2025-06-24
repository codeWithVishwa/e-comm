const DashboardCard = ({ icon, title, description, onClick, color = 'purple' }) => {
    const colorClasses = {
        red: 'bg-red-100 text-red-800 hover:bg-red-200',
        blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        green: 'bg-green-100 text-green-800 hover:bg-green-200',
        orange:'bg-orange-100 text-orange-800 hover:bg-orange-200'
    };

    return (
        <div 
            onClick={onClick}
            className={`${colorClasses[color]} rounded-lg shadow p-6 cursor-pointer transition-colors duration-200`}
        >
            <div className="flex items-center">
                <div className={`p-3 rounded-full bg-white mr-4`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm mt-1">{description}</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardCard