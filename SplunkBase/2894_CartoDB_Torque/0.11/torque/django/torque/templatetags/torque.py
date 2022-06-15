from django import template
from splunkdj.templatetags.tagutils import component_context


register = template.Library()


@register.inclusion_tag('torque:torquetag.html', takes_context=True)
def torque(context, id, *args, **kwargs):
    return component_context(
        context,
        "torqueview",
        id,
        "view",
        "torque/torqueview",
        kwargs,
        classes="torque-map"
    )
