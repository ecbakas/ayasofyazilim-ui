const AutoFormTooltip = ({ fieldConfigItem }: { fieldConfigItem: any }) => {
  const descriptionElement = fieldConfigItem?.description && (
    <div className="text-sm text-gray-500">{fieldConfigItem.description}</div>
  );
  return descriptionElement;
};

export default AutoFormTooltip;
