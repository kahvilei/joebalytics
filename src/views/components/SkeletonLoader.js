//renders a skeleton loader for the loading state of the app
function SkeletonLoader(props) {
    return (
        <div>
            <div className={"match skeleton-loader"}>
            </div>
            <div className={"match skeleton-loader"}>
            </div>
            <div className={"match skeleton-loader"}>
            </div>
        </div>

    );
}

export default SkeletonLoader;
