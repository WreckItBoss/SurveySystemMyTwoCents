import "./PageNavigation.css";

export default function PageNavigation({
    onPrevious,
    onNext,
    previousDisabled = false,
    nextDisabled = false,
    showPrevious = true,
    showNext = true,
    nextLabel = "次へ",
    previousLabel = "戻る"
}){
    return(
        <div className="page-navigation">
            <div>
                {showPrevious && (
                    <button
                        className="page-navigation__button page-navigation__button--secondary"
                        onClick={onPrevious}
                        disabled={previousDisabled}
                    >
                        {previousLabel}
                    </button>
                )}
            </div>
            <div>
                {showNext && (
                    <button
                        className="page-navigation__button page-navigation__button--primary"
                        onClick={onNext}
                        disabled={nextDisabled}
                    >
                        {nextLabel}
                    </button>
                )}
            </div>
        </div>
    );
}